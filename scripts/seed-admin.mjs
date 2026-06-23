import bcrypt from "bcryptjs";

const email = process.env.ADMIN_EMAIL || "admin@purplefireflies.org";
const password = process.env.ADMIN_PASSWORD || "Admin123!";
const name = process.env.ADMIN_NAME || "Admin";
const role = process.env.ADMIN_ROLE || "admin";

async function main() {
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(password, salt);

  const sql = `INSERT INTO admins (email, name, password_hash, role) VALUES ('${email}', '${name}', '${hash}', '${role}');`;

  console.log("Run this with wrangler d1 execute:\n");
  console.log(
    `wrangler d1 execute purple-fireflies-db --remote --command="${sql}"`
  );
  console.log("\nOr for local dev:");
  console.log(
    `wrangler d1 execute purple-fireflies-db --local --command="${sql}"`
  );
}

main().catch(console.error);
