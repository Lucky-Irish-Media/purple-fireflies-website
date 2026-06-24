import fs from "fs";
import path from "path";

const csvPath = path.join(process.cwd(), "driver_volunteers_import.csv");
const content = fs.readFileSync(csvPath, "utf-8");
const lines = content.trim().split("\n");
const headers = lines[0].split(",");

function escapeSql(str) {
  return str.replace(/'/g, "''");
}

function getDeliveryDay(dateStr) {
  const date = new Date(dateStr + "T00:00:00Z");
  const day = date.getUTCDay();
  return day === 3 ? "wednesday" : "thursday";
}

const statements = lines.slice(1).map((line) => {
  const [name, email, phone, onSignal, regions, deliveryDate] = line.split(",");
  const deliveryDay = getDeliveryDay(deliveryDate);
  return `INSERT INTO driver_volunteers (name, email, phone, on_signal, regions, delivery_day, delivery_date) VALUES ('${escapeSql(name)}', '${escapeSql(email)}', '${escapeSql(phone)}', '${escapeSql(onSignal)}', '${escapeSql(regions)}', '${deliveryDay}', '${deliveryDate}');`;
});

console.log("Run these with wrangler d1 execute:\n");
for (const stmt of statements) {
  console.log(`wrangler d1 execute purple-fireflies-db --remote --command="${stmt}"`);
}
console.log("\nOr for local dev:");
for (const stmt of statements) {
  console.log(`wrangler d1 execute purple-fireflies-db --local --command="${stmt}"`);
}