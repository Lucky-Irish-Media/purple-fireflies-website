import bcrypt from "bcryptjs";
import { execSync } from "child_process";
import fs from "fs";

// Usage:
//   node scripts/backfill-volunteer-accounts.mjs [--env preview] [--days 14] [--status active]
//
// Creates `users` accounts (role='volunteer') for participants who have
// driver_volunteers signups in the last N days but no existing account.
// Emits INSERT SQL to /tmp/backfill_volunteer_accounts.sql for review and
// prints an email -> temp password table. It does NOT write to the DB itself.

function usage() {
  console.log(`Usage: node scripts/backfill-volunteer-accounts.mjs [options]
  --env <env>      wrangler env to target (default: the default/main env, e.g. production)
  --days <n>       only volunteers with a signup in the last n days (default: 14)
  --status <s>     status for new accounts: active | pending (default: active)
  --help           show this help`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { env: null, days: 14, status: "active" };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--env") opts.env = args[++i];
    else if (args[i] === "--days") opts.days = Number(args[++i]);
    else if (args[i] === "--status") opts.status = args[++i];
    else if (args[i] === "--help") {
      usage();
      process.exit(0);
    } else {
      console.error(`Unknown argument: ${args[i]}`);
      usage();
      process.exit(1);
    }
  }
  if (!Number.isInteger(opts.days) || opts.days < 1) {
    console.error("--days must be a positive integer");
    process.exit(1);
  }
  if (!["active", "pending"].includes(opts.status)) {
    console.error("--status must be 'active' or 'pending'");
    process.exit(1);
  }
  return opts;
}

function esc(val) {
  if (val === null || val === undefined) return "NULL";
  return "'" + String(val).replace(/'/g, "''") + "'";
}

function generateRandomPassword() {
  const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
  const DIGITS = "0123456789";
  const SPECIAL = "!@#$%^&*()_+-=";
  const ALL = UPPERCASE + LOWERCASE + DIGITS + SPECIAL;
  const array = new Uint8Array(20);
  crypto.getRandomValues(array);
  const password = [];
  password.push(UPPERCASE[array[0] % UPPERCASE.length]);
  password.push(LOWERCASE[array[1] % LOWERCASE.length]);
  password.push(DIGITS[array[2] % DIGITS.length]);
  password.push(SPECIAL[array[3] % SPECIAL.length]);
  for (let i = 4; i < 20; i++) {
    password.push(ALL[array[i] % ALL.length]);
  }
  for (let i = password.length - 1; i > 0; i--) {
    const j = array[i] % (i + 1);
    [password[i], password[j]] = [password[j], password[i]];
  }
  return password.join("");
}

function queryParticipants(opts) {
  const sql = `SELECT p.id, p.name, p.email, COUNT(dv.id) AS signup_count FROM participants p JOIN driver_volunteers dv ON dv.participant_id = p.id WHERE dv.delivery_date >= date('now', '-${opts.days} days') AND NOT EXISTS (SELECT 1 FROM users u WHERE LOWER(u.email) = LOWER(p.email)) GROUP BY p.id ORDER BY p.name`;
  const cmd = `npx wrangler d1 execute purple-fireflies-db${opts.env ? ` --env ${opts.env}` : ""} --remote --command ${JSON.stringify(sql)} --json`;
  const stdout = execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
  const parsed = JSON.parse(stdout.trim());
  const block = Array.isArray(parsed) ? parsed[0] : parsed;
  if (!block || !block.success) {
    throw new Error("D1 query failed");
  }
  return block.results || [];
}

const opts = parseArgs();
const envFlag = opts.env ? ` --env ${opts.env}` : "";

console.log(`Scanning ${opts.env ? opts.env + " " : ""}D1 for volunteers with signups in the last ${opts.days} days...`);

let participants;
try {
  participants = queryParticipants(opts);
} catch (e) {
  console.error("Failed to query D1:", e.message);
  process.exit(1);
}

if (participants.length === 0) {
  console.log("No participants found without an existing account. Nothing to do.");
  process.exit(0);
}

const accounts = [];
for (const p of participants) {
  const tempPassword = generateRandomPassword();
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(tempPassword, salt);
  accounts.push({
    email: p.email.toLowerCase(),
    name: p.name,
    passwordHash,
    signupCount: p.signup_count,
    tempPassword,
  });
}

const header = `-- Backfill volunteer accounts
-- Generated: ${new Date().toISOString()}
-- Apply with:
--   npx wrangler d1 execute purple-fireflies-db${envFlag} --remote --file /tmp/backfill_volunteer_accounts.sql
-- New accounts: role='volunteer', status='${opts.status}', emails lowercased.
`;
const inserts = accounts.map(
  (a) =>
    `INSERT INTO users (email, name, password_hash, role, status, created_at) VALUES (${esc(a.email)}, ${esc(a.name)}, ${esc(a.passwordHash)}, 'volunteer', '${opts.status}', datetime('now'));`
);
fs.writeFileSync("/tmp/backfill_volunteer_accounts.sql", header + inserts.join("\n") + "\n", "utf-8");

console.log(`\nBackfill SQL written to /tmp/backfill_volunteer_accounts.sql`);
console.log(`Accounts to create: ${accounts.length}\n`);
console.log("Email | Name | Signups | Temporary password");
for (const a of accounts) {
  console.log(`${a.email} | ${a.name} | ${a.signupCount} | ${a.tempPassword}`);
}
console.log(`\nTo apply: npx wrangler d1 execute purple-fireflies-db${envFlag} --remote --file /tmp/backfill_volunteer_accounts.sql`);
