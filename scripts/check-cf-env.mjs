// Preflight for `npm run build:cf`.
//
// OpenNext reads every Next.js .env* file at build time and compiles the
// values into the deployed Worker bundle (@opennextjs/cloudflare's
// compile-env-files.js). In production mode it then applies .env, .env.local,
// .env.production and .env.production.local as runtime fallbacks — so a
// server secret in one of those would ship in plaintext AND silently stand
// in for a missing `wrangler secret`. A DATABASE_URL in any baked file is a
// real credential sitting in the bundle even if never applied. Fail instead.
import { existsSync, readFileSync } from "node:fs";

const SECRET_KEYS = ["ADMIN_SECRET", "ADMIN_PASSWORD", "DATABASE_URL"];
const PRODUCTION_APPLIED = [".env", ".env.local", ".env.production", ".env.production.local"];
const BAKED_ONLY = [".env.development", ".env.development.local", ".env.test", ".env.test.local"];

function nonEmptySecretKeys(file) {
  if (!existsSync(file)) return [];
  return readFileSync(file, "utf-8")
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*?)\s*$/))
    .filter((m) => m && SECRET_KEYS.includes(m[1]) && m[2].replace(/^["']|["']$/g, "") !== "")
    .map((m) => m[1]);
}

const problems = [
  ...PRODUCTION_APPLIED.flatMap((file) => nonEmptySecretKeys(file).map((key) => `${key} in ${file}`)),
  ...BAKED_ONLY.flatMap((file) =>
    nonEmptySecretKeys(file)
      .filter((key) => key === "DATABASE_URL")
      .map((key) => `${key} in ${file}`)
  ),
];

if (problems.length > 0) {
  console.error(
    [
      "build:cf refused — these secrets would be compiled into the deployed Worker bundle:",
      ...problems.map((p) => `  - ${p}`),
      "",
      "Fix:",
      "  - Production secrets: npx wrangler secret put ADMIN_SECRET / DATABASE_URL",
      "  - Local `next dev` ADMIN_SECRET: move it to .env.development.local",
      "  - Local DATABASE_URL: set it in your shell for that session, not in any .env* file",
    ].join("\n")
  );
  process.exit(1);
}
