/**
 * Wipes and seeds a fresh PostgreSQL database with the canonical SEED_STATE
 * from lib/seed-data.ts — the exact same 6 vehicles (across Ontario,
 * mid-Atlantic, and Tin Can Island), users, shipments, tracking logs, and
 * the 2 sourcing requests that back the local data/db.json fallback and
 * the client's localStorage cache.
 *
 * Run via `npm run db:seed` (wired to `prisma db seed` / `prisma migrate
 * reset` through the "prisma.seed" entry in package.json). Requires
 * DATABASE_URL to be set — this script always writes to Postgres via
 * Prisma, regardless of whether the app itself is currently running
 * against the JSON fallback.
 *
 * Wipes every existing row first — refuses to run against NODE_ENV=production
 * unless ALLOW_PRODUCTION_SEED=true is also set, so it can't double as an
 * accidental "delete all live data" command.
 */
import { SEED_STATE } from "../lib/seed-data";
import { writeStateToDatabase } from "../lib/db";

async function main() {
  if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.trim()) {
    console.error(
      "DATABASE_URL is not set — nothing to seed. Set it in your environment " +
        "(or .env.local) to a Postgres connection string and try again."
    );
    process.exit(1);
  }

  // This wipes every row before reseeding — safe against a fresh staging DB,
  // destructive against a live one with real admin inventory edits or buyer
  // sourcing mandates. Require an explicit opt-in once NODE_ENV says
  // production, rather than let a stray `prisma migrate reset` or a copy-
  // pasted CI step silently erase production data.
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_PRODUCTION_SEED !== "true") {
    console.error(
      "Refusing to seed: NODE_ENV=production. This wipes all existing data. " +
        "If you really mean to reset a live database, set ALLOW_PRODUCTION_SEED=true and run again."
    );
    process.exit(1);
  }

  console.log("Seeding database from lib/seed-data.ts ...");
  await writeStateToDatabase(SEED_STATE);
  console.log(
    `Done — seeded ${SEED_STATE.users.length} users, ${SEED_STATE.vehicles.length} vehicles, ` +
      `${SEED_STATE.shipments.length} shipments, ${SEED_STATE.trackingLogs.length} tracking logs, ` +
      `${SEED_STATE.sourcingRequests.length} sourcing requests.`
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(() => process.exit(0));
