import db from '../config/db.js';


export function allRelays() {
    return db.prepare('SELECT * FROM relays ORDER BY id').all();
}


export function createRelay(name, gpio_pin) {
    const info = db.prepare('INSERT INTO relays (name, gpio_pin, active) VALUES (?, ?, 0)').run(name, gpio_pin);
    return db.prepare('SELECT * FROM relays WHERE id = ?').get(info.lastInsertRowid);
}


export function getRelay(id) {
    return db.prepare('SELECT * FROM relays WHERE id = ?').get(id);
}


export function setRelayActive(id, active) {
    return db.prepare('UPDATE relays SET active = ? WHERE id = ?').run(active ? 1 : 0, id);
}
