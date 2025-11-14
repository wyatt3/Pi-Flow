import db from '../config/db.js';


export function allSchedules() {
    return db.prepare('SELECT * FROM schedules ORDER BY start_time').all();
}


export function getSchedule(id) {
    return db.prepare('SELECT * FROM schedules WHERE id = ?').get(id);
}


export function upsertSchedule(relay_id, start_time, duration_min) {
    const info = db.prepare('INSERT INTO schedules (relay_id, start_time, duration_min) VALUES (?, ?, ?)').run(relay_id, start_time, duration_min);
    return db.prepare('SELECT * FROM schedules WHERE id = ?').get(info.lastInsertRowid);
}
