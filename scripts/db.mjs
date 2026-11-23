#!/usr/bin/env node
// Supabase helper commands. Reads .env / .env.local the same way Next.js does.
//
//   npm run db:setup     create/update tables, security rules and image bucket
//                        (supabase/schema.sql), then sync the admin login
//   npm run admin:sync   only sync the admin login from ADMIN_EMAIL / ADMIN_PASSWORD

import fs from "node:fs";
import path from "node:path";
import nextEnv from "@next/env";
import { connect, syncAdmin } from "./admin-sync.mjs";

nextEnv.loadEnvConfig(process.cwd());

const command = process.argv[2];
if (command !== "setup" && command !== "admin") {
  console.error("Usage: node scripts/db.mjs <setup|admin>");
  process.exit(1);
}

const client = await connect().catch((e) => {
  console.error(`Could not connect to the database: ${e.message}`);
  console.error("Check DATABASE_URL in .env (Supabase → Connect → Session pooler).");
  process.exit(1);
});

try {
  if (command === "setup") {
    const sql = fs.readFileSync(path.join(process.cwd(), "supabase", "schema.sql"), "utf8");
    await client.query(sql);
    console.log("✓ Schema applied: posts, admins, security rules, blog-images bucket");
  }
  console.log(`✓ ${await syncAdmin(client)}`);
} catch (e) {
  console.error(`✗ ${e.message}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
