import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dbPath = process.env.DB_FILE || path.resolve('database', 'database.sqlite');
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(dbPath);

// initialize schema
db.exec(`
CREATE TABLE IF NOT EXISTS relays (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
gpio_pin INTEGER NOT NULL,
active INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS schedules (
id INTEGER PRIMARY KEY AUTOINCREMENT,
relay_id INTEGER NOT NULL,
start_time TIME NOT NULL,
duration_min INTEGER NOT NULL,
one_time BOOLEAN DEFAULT 0,
status TEXT NOT NULL DEFAULT 'scheduled',
FOREIGN KEY(relay_id) REFERENCES relays(id)
);

CREATE TABLE IF NOT EXISTS schedule_days (
id INTEGER PRIMARY KEY AUTOINCREMENT,
schedule_id INTEGER NOT NULL,
day INTEGER NOT NULL,
FOREIGN KEY(schedule_id) REFERENCES schedules(id)
);
`);

export default db;
