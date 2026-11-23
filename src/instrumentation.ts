// Runs once when the Next.js server starts. Syncs the blog admin login from
// ADMIN_EMAIL / ADMIN_PASSWORD in .env, so changing them there and restarting
// the server (or redeploying) changes the login. Skipped if those or
// DATABASE_URL aren't set; failures are logged and never stop the server.

export async function register() {
  // The import must sit inside this exact check so it's left out of the edge bundle.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    if (process.env.NEXT_PHASE === "phase-production-build") return;
    const { syncAdminFromEnv } = await import("../scripts/admin-sync.mjs");
    await syncAdminFromEnv();
  }
}
