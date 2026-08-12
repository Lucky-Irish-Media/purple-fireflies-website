import bcrypt from "bcryptjs";
import fs from "fs";

function pick(...args) {
  return args[Math.floor(Math.random() * args.length)];
}

function esc(val) {
  if (val === null || val === undefined) return "NULL";
  return "'" + String(val).replace(/'/g, "''") + "'";
}

const FIRST_NAMES = [
  "James","Mary","Robert","Patricia","John","Jennifer","Michael","Linda",
  "David","Barbara","William","Elizabeth","Richard","Susan","Joseph","Jessica",
  "Thomas","Sarah","Christopher","Karen","Charles","Lisa","Daniel","Nancy",
  "Matthew","Betty","Anthony","Margaret","Mark","Sandra","Donald","Ashley",
  "Steven","Kimberly","Paul","Emily","Andrew","Donna","Joshua","Michelle",
  "Kenneth","Carol","Kevin","Amanda","Brian","Dorothy","George","Melissa",
  "Timothy","Deborah","Ronald","Stephanie","Edward","Rebecca","Jason","Sharon",
  "Jeffrey","Laura","Ryan","Cynthia","Jacob","Kathleen","Gary","Amy",
  "Nicholas","Angela","Eric","Shirley","Jonathan","Anna","Stephen","Brenda",
  "Larry","Pamela","Justin","Emma","Scott","Nicole","Brandon","Helen",
  "Benjamin","Samantha","Samuel","Katherine","Raymond","Christine","Gregory","Debra",
  "Frank","Rachel","Alexander","Carolyn","Patrick","Janet","Jack","Catherine",
  "Dennis","Maria","Jerry","Heather", "Sandy", "Tina", "Connie"
];

const LAST_NAMES = [
  "Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis",
  "Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson",
  "Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson",
  "White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson","Walker",
  "Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores",
  "Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell",
  "Carter","Roberts","Gomez","Phillips","Evans","Turner","Diaz","Parker",
  "Cruz","Edwards","Collins","Reyes","Stewart","Morris","Morales","Murphy",
  "Cook","Rogers","Gutierrez","Ortiz","Morgan","Cooper","Peterson","Bailey",
  "Reed","Kelly","Howard","Ramos","Kim","Cox","Ward","Richardson",
  "Watson","Brooks","Chavez","Wood","James","Bennett","Gray","Mendoza",
  "Ruiz","Hughes","Price","Alvarez","Castillo","Sanders","Patel","Myers",
  "Long","Ross","Foster","Jimenez","Hensley","Edinger","Melius","Covert",
  "Eblin","Wetzel","Howland","Odom","Burkholder","Sauer","Gibbons",
  "Abdella","Pantoja","Wilson"
];

const STREETS = [
  "Elm St","Maple Ave","Oak St","Pine St","Cedar Ln","Birch Dr",
  "Walnut St","Cherry Blvd","Main St","High St","Church St","Washington St",
  "Market St","State St","College St","Union St","Richland Ave",
  "Morrison Ave","Stewart St","Broadway","Mulberry St","Crawford St",
  "Mill St","Canal St","Jefferson St","Madison Ave","Monroe Dr",
  "River Rd","Valley Rd","Hillcrest Dr","Lake Dr","Park Ave",
  "Hickory Ln","Dogwood Dr","Magnolia Way","Beechwood Dr","Red Maple Rd",
  "Baker Rd","Bean Rd","Sugar Creek Rd","Heritage Dr",
  "White Oak Ln","Woods Dr","Carriage Hill Rd","Fox Run Rd",
  "Orchard Dr","Meadow Ln","Spring St","West Franklin St",
  "Central Ave","May Ave","South 11th St","North St","East St",
];

const CITIES = ["Athens","The Plains","Chauncey","Glouster","Nelsonville","Jacksonville","Albany","Coolville","Amesville","Stewart"];
const ZIP_CODES = ["45701","45780","45719","45732","45764","45740","45710","45723","45711","45778"];
const REGIONS = ["North","South","East","West","The Plains","Chauncey","Glouster/Jacksonville/Trimble"];

function generatePhone() {
  const prefixes = ["740","614","330","513","937","567","419","216","440","234"];
  const p = pick(...prefixes);
  const m = String(Math.floor(Math.random() * 900) + 100);
  const l = String(Math.floor(Math.random() * 9000) + 1000);
  return `(${p}) ${m}-${l}`;
}

function generateEmail(first, last) {
  const domains = ["gmail.com","yahoo.com","hotmail.com","outlook.com","aol.com","icloud.com","proton.me"];
  const num = Math.random() > 0.5 ? "" : String(Math.floor(Math.random() * 99) + 1);
  return `${first.toLowerCase()}.${last.toLowerCase()}${num}@${pick(...domains)}`;
}

function getDeliveryDay(dateStr) {
  const d = new Date(dateStr + "T12:00:00Z");
  const day = d.getUTCDay();
  if (day === 3) return "wednesday";
  if (day === 4) return "thursday";
  return null;
}

function getNextWednesdaysThursdays(count) {
  const dates = [];
  let d = new Date("2026-07-30T12:00:00Z");
  const DAY_MS = 86400000;
  while (dates.length < count) {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    const ds = `${y}-${m}-${day}`;
    const dow = d.getUTCDay();
    if (dow === 3 || dow === 4) dates.push(ds);
    d = new Date(d.getTime() + DAY_MS);
  }
  return dates;
}

const participantCount = 25;
const participants = [];
const usedEmails = new Set();

for (let i = 0; i < participantCount; i++) {
  let first, last, email;
  do {
    first = pick(...FIRST_NAMES);
    last = pick(...LAST_NAMES);
    email = generateEmail(first, last);
  } while (usedEmails.has(email));
  usedEmails.add(email);

  const cityIndex = i % CITIES.length;
  const num = Math.floor(Math.random() * 9000) + 100;
  const street = pick(...STREETS);
  const lot = Math.random() > 0.7 ? `Lot ${Math.floor(Math.random() * 50) + 1}` : null;
  const phone = generatePhone();
  const contactMethod = pick("call", "text", "email");
  const notes = Math.random() > 0.8 ? pick(
    "Front door delivery", "Please text before arriving",
    "Dog in backyard - use front door", "Leave on porch",
    "Ring bell for delivery", "Please knock loudly"
  ) : null;

  participants.push({
    name: `${first} ${last}`,
    email,
    phone,
    address1: `${num} ${street}`,
    address2: lot,
    city: CITIES[cityIndex],
    state: "OH",
    zip_code: ZIP_CODES[cityIndex],
    contact_method: contactMethod,
    internal_notes: notes,
  });
}

const deliveryDates = getNextWednesdaysThursdays(8);

const mealSignups = [];
let signupId = 1;
for (const p of participants) {
  const numSignups = Math.floor(Math.random() * 4) + 2;
  const shuffled = [...deliveryDates].sort(() => Math.random() - 0.5).slice(0, numSignups);
  for (const date of shuffled) {
    const dow = getDeliveryDay(date);
    if (!dow) continue;
    const rq = Math.random() > 0.6 ? 1 : 0;
    const vq = rq === 1 ? (Math.random() > 0.5 ? 1 : 0) : (Math.random() > 0.3 ? 1 : 2);
    if (rq + vq < 1 || rq + vq > 2) continue;
    const comments = Math.random() > 0.85 ? pick(
      "Front door please", "Text when on the way",
      "Leave on porch", "Don't ring bell - baby sleeping",
      "Please knock loudly", "Back door entrance"
    ) : null;
    const bag = Math.random() > 0.6 ? `B${String(signupId).padStart(3, "0")}` : null;
    mealSignups.push({
      id: signupId,
      participant_index: participants.indexOf(p),
      regular_quantity: rq,
      vegan_quantity: vq,
      delivery_day: dow,
      delivery_date: date,
      comments,
      bag_number: bag,
    });
    signupId++;
  }
}

const driverVolunteers = [];
let driverId = 1;
const driverParticipants = [...participants].sort(() => Math.random() - 0.5).slice(0, 7);
for (const p of driverParticipants) {
  const numDrives = Math.floor(Math.random() * 3) + 1;
  const shuffled = [...deliveryDates].sort(() => Math.random() - 0.5).slice(0, numDrives);
  for (const date of shuffled) {
    const dow = getDeliveryDay(date);
    if (!dow) continue;
    const numRegions = Math.floor(Math.random() * 3) + 1;
    const shuffledRegions = [...REGIONS].sort(() => Math.random() - 0.5).slice(0, numRegions);
    driverVolunteers.push({
      id: driverId,
      participant_index: participants.indexOf(p),
      on_signal: pick("yes", "yes", "willing"),
      regions: shuffledRegions.join(","),
      delivery_day: dow,
      delivery_date: date,
    });
    driverId++;
  }
}

const assignments = [];
let assignmentId = 1;
const signupsByDate = {};
for (const s of mealSignups) {
  if (!signupsByDate[s.delivery_date]) signupsByDate[s.delivery_date] = [];
  signupsByDate[s.delivery_date].push(s);
}
const driversByDate = {};
for (const d of driverVolunteers) {
  if (!driversByDate[d.delivery_date]) driversByDate[d.delivery_date] = [];
  driversByDate[d.delivery_date].push(d);
}
for (const [date, signups] of Object.entries(signupsByDate)) {
  const drivers = driversByDate[date] || [];
  if (drivers.length === 0) continue;
  for (const s of signups) {
    if (Math.random() > 0.6) continue;
    const driver = pick(...drivers);
    const notes = Math.random() > 0.8 ? "Deliver before 5pm" : null;
    assignments.push({
      id: assignmentId,
      meal_signup_id: s.id,
      driver_volunteer_id: driver.id,
      notes,
      bag_number: s.bag_number || `B${String(s.id).padStart(3, "0")}`,
    });
    assignmentId++;
  }
}

const reminderLogs = deliveryDates.map(date => ({
  delivery_date: date,
  sent_count: mealSignups.filter(s => s.delivery_date === date).length,
  failed_count: Math.floor(Math.random() * 2),
}));

const waitlistEntries = [];
let waitlistId = 1;
const fullDates = [deliveryDates[0], deliveryDates[3], deliveryDates[5]];
const waitlistPeople = [...participants].sort(() => Math.random() - 0.5).slice(18, 24);
for (const date of fullDates) {
  for (const p of waitlistPeople) {
    if (Math.random() > 0.6) continue;
    waitlistEntries.push({
      id: waitlistId,
      participant_index: participants.indexOf(p),
      delivery_date: date,
      regular_quantity: Math.random() > 0.5 ? 1 : 0,
      vegan_quantity: Math.random() > 0.5 ? 1 : 0,
      status: pick("waiting", "waiting", "notified", "expired"),
    });
    waitlistId++;
  }
}

const passwordHash = await bcrypt.hash("Admin123!", 12);

const lines = [];

lines.push(`INSERT INTO users (email, name, password_hash, role, created_at) VALUES ('admin@purplefireflies.org', 'Admin', ${esc(passwordHash)}, 'admin', datetime('now'));`);
lines.push(`INSERT INTO users (email, name, password_hash, role, created_at) VALUES ('coordinator@purplefireflies.org', 'Program Coordinator', ${esc(passwordHash)}, 'member', datetime('now'));`);

for (const p of participants) {
  lines.push(`INSERT INTO participants (name, email, phone, address1, address2, city, state, zip_code, contact_method, internal_notes, created_at, updated_at) VALUES (${esc(p.name)}, ${esc(p.email)}, ${esc(p.phone)}, ${esc(p.address1)}, ${esc(p.address2)}, ${esc(p.city)}, ${esc(p.state)}, ${esc(p.zip_code)}, ${esc(p.contact_method)}, ${esc(p.internal_notes)}, datetime('now'), datetime('now'));`);
}

for (const s of mealSignups) {
  lines.push(`INSERT INTO meal_signups (participant_id, regular_quantity, vegan_quantity, delivery_day, delivery_date, comments, bag_number, created_at) VALUES (${s.participant_index + 1}, ${s.regular_quantity}, ${s.vegan_quantity}, ${esc(s.delivery_day)}, ${esc(s.delivery_date)}, ${esc(s.comments)}, ${esc(s.bag_number)}, datetime('now'));`);
}

for (const d of driverVolunteers) {
  lines.push(`INSERT INTO driver_volunteers (participant_id, on_signal, regions, delivery_day, delivery_date, created_at) VALUES (${d.participant_index + 1}, ${esc(d.on_signal)}, ${esc(d.regions)}, ${esc(d.delivery_day)}, ${esc(d.delivery_date)}, datetime('now'));`);
}

for (const a of assignments) {
  lines.push(`INSERT INTO delivery_assignments (meal_signup_id, driver_volunteer_id, notes, bag_number, created_at) VALUES (${a.meal_signup_id}, ${a.driver_volunteer_id}, ${esc(a.notes)}, ${esc(a.bag_number)}, datetime('now'));`);
}

for (const r of reminderLogs) {
  lines.push(`INSERT INTO reminder_logs (delivery_date, sent_count, failed_count, created_at) VALUES (${esc(r.delivery_date)}, ${r.sent_count}, ${r.failed_count}, datetime('now'));`);
}

for (const w of waitlistEntries) {
  lines.push(`INSERT INTO waitlist (participant_id, delivery_date, regular_quantity, vegan_quantity, status, created_at) VALUES (${w.participant_index + 1}, ${esc(w.delivery_date)}, ${w.regular_quantity}, ${w.vegan_quantity}, ${esc(w.status)}, datetime('now'));`);
}

const sql = lines.join("\n");
fs.writeFileSync("/tmp/seed_preview.sql", sql, "utf-8");
console.log(`Seed SQL written to /tmp/seed_preview.sql`);
console.log(`Lines: ${lines.length}`);
console.log(`\nData generated:`);
console.log(`  Users: 2`);
console.log(`  Participants: ${participants.length}`);
console.log(`  Meal Signups: ${mealSignups.length}`);
console.log(`  Driver Volunteers: ${driverVolunteers.length}`);
console.log(`  Delivery Assignments: ${assignments.length}`);
console.log(`  Reminder Logs: ${reminderLogs.length}`);
console.log(`  Waitlist Entries: ${waitlistEntries.length}`);
