// Keeps the blog admin login in Supabase in step with ADMIN_EMAIL / ADMIN_PASSWORD
// from .env. Used by `npm run admin:sync`, `npm run db:setup` and on every server
// start (src/instrumentation.ts), so changing the values in .env and restarting
// is all it takes to change the login.
//
// Talks to Postgres directly through DATABASE_URL (the Supabase connection string),
// because creating users and setting passwords needs more than the public key allows.

import pg from "pg";

const MANAGED_FLAG = "env_admin"; // marks the user this file manages, in auth.users.raw_app_meta_data
const MIN_PASSWORD = 6; // Supabase Auth's own minimum
const RECOMMENDED_PASSWORD = 12;

/** Open a client for DATABASE_URL (Supabase needs SSL; its pooler cert isn't in Node's CA list). */
export async function connect(databaseUrl = process.env.DATABASE_URL) {
  if (!databaseUrl) throw new Error("DATABASE_URL is not set.");
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  });
  await client.connect();
  return client;
}

/**
 * Create or update the admin user from env. Returns a short description of what changed.
 * Throws with a readable message if something is missing.
 */
export async function syncAdmin(client, { email = process.env.ADMIN_EMAIL, password = process.env.ADMIN_PASSWORD } = {}) {
  email = (email ?? "").trim().toLowerCase();
  password = password ?? "";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("ADMIN_EMAIL is missing or not an email address.");
  if (password.length < MIN_PASSWORD) throw new Error(`ADMIN_PASSWORD must be at least ${MIN_PASSWORD} characters.`);

  const { rows: tableCheck } = await client.query("select to_regclass('public.admins') as t");
  if (!tableCheck[0].t) throw new Error("The blog tables don't exist yet. Run `npm run db:setup` first.");

  const changes = [];
  await client.query("begin");
  try {
    const byEmail = (await client.query("select id from auth.users where lower(email) = $1 limit 1", [email])).rows[0];
    const managed = (
      await client.query(`select id, email from auth.users where raw_app_meta_data->>'${MANAGED_FLAG}' = 'true' limit 1`)
    ).rows[0];

    let userId;
    if (byEmail) {
      userId = byEmail.id;
      // ADMIN_EMAIL now points at a different existing user: the old env admin loses admin rights.
      if (managed && managed.id !== byEmail.id) {
        await client.query(
          `update auth.users set raw_app_meta_data = raw_app_meta_data - '${MANAGED_FLAG}' where id = $1`,
          [managed.id],
        );
        await client.query("delete from public.admins where user_id = $1", [managed.id]);
        await signOutEverywhere(client, managed.id);
        changes.push(`removed admin rights from ${managed.email}`);
      }
    } else if (managed) {
      // ADMIN_EMAIL changed: rename the existing admin user instead of creating a second one.
      userId = managed.id;
      await client.query("update auth.users set email = $2, updated_at = now() where id = $1", [userId, email]);
      await client.query(
        `update auth.identities set identity_data = identity_data || jsonb_build_object('email', $2::text)
          where user_id = $1 and provider = 'email'`,
        [userId, email],
      );
      await signOutEverywhere(client, userId);
      changes.push(`changed admin email ${managed.email} → ${email}`);
    } else {
      const { rows } = await client.query(
        `insert into auth.users (
           instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
           raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
           confirmation_token, recovery_token, email_change_token_new, email_change,
           email_change_token_current, phone_change, phone_change_token, reauthentication_token,
           is_sso_user, is_anonymous)
         values (
           '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
           $1, extensions.crypt($2, extensions.gen_salt('bf', 10)), now(),
           jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email'), '${MANAGED_FLAG}', true),
           '{}'::jsonb, now(), now(),
           '', '', '', '', '', '', '', '',
           false, false)
         returning id`,
        [email, password],
      );
      userId = rows[0].id;
      await client.query(
        `insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
         values ($1::text, $1::uuid, jsonb_build_object('sub', $1::text, 'email', $2::text, 'email_verified', true, 'phone_verified', false),
                 'email', now(), now(), now())`,
        [userId, email],
      );
      changes.push(`created admin user ${email}`);
    }

    // Password: only rewrite (and sign out old sessions) when it actually changed.
    const { rows: pw } = await client.query(
      "select coalesce(encrypted_password = extensions.crypt($2, encrypted_password), false) as same from auth.users where id = $1",
      [userId, password],
    );
    if (!pw[0].same) {
      await client.query(
        "update auth.users set encrypted_password = extensions.crypt($2, extensions.gen_salt('bf', 10)), updated_at = now() where id = $1",
        [userId, password],
      );
      if (!changes.some((c) => c.startsWith("created"))) {
        await signOutEverywhere(client, userId);
        changes.push("updated admin password (other sessions signed out)");
      }
    }

    // Make sure the account can sign in and is an admin.
    await client.query(
      `update auth.users
          set email_confirmed_at = coalesce(email_confirmed_at, now()),
              banned_until = null,
              deleted_at = null,
              raw_app_meta_data = raw_app_meta_data || jsonb_build_object('${MANAGED_FLAG}', true)
        where id = $1`,
      [userId],
    );
    const { rowCount } = await client.query(
      "insert into public.admins (user_id) values ($1) on conflict (user_id) do nothing",
      [userId],
    );
    if (rowCount) changes.push(`granted admin rights to ${email}`);

    await client.query("commit");
  } catch (e) {
    await client.query("rollback").catch(() => {});
    throw e;
  }
  const summary = changes.length ? changes.join("; ") : `admin ${email} already up to date`;
  return password.length < RECOMMENDED_PASSWORD
    ? `${summary}. Warning: ADMIN_PASSWORD is short; use ${RECOMMENDED_PASSWORD}+ characters before going live.`
    : summary;
}

async function signOutEverywhere(client, userId) {
  await client.query("delete from auth.refresh_tokens where user_id = $1::text", [userId]);
  await client.query("delete from auth.sessions where user_id = $1", [userId]);
}

/** Connect, sync, disconnect. Used at server start; never throws. */
export async function syncAdminFromEnv({ log = console } = {}) {
  if (!process.env.DATABASE_URL || !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) return;
  let client;
  try {
    client = await connect();
    log.info(`[admin] ${await syncAdmin(client)}`);
  } catch (e) {
    log.warn(`[admin] could not sync the admin login from .env: ${e instanceof Error ? e.message : e}`);
  } finally {
    await client?.end().catch(() => {});
  }
}
