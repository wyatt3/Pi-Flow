import db from '../config/db.js';
import { Relay } from '../models/relay.js';

export class RelayService {
    static create({ name, gpio_pin, active = 0 }) {
        return db.run(
            `INSERT INTO relays (name, gpio_pin, active)
       VALUES (?, ?, ?)`,
            [name, gpio_pin, active]
        ).then(result => new Relay({ id: result.lastID, name, gpio_pin, active }));
    }

    // Save updates to this relay
    async save() {
        const db = await getDB();
        await db.run(
            `UPDATE relays SET name = ?, gpio_pin = ?, active = ?
       WHERE id = ?`,
            [this.name, this.gpio_pin, this.active, this.id]
        );
        return this;
    }

    // Delete this relay
    async delete() {
        const db = await getDB();
        await db.run(`DELETE FROM relays WHERE id = ?`, [this.id]);
    }

    // Toggle relay active flag (optional helper)
    async toggle() {
        this.active = this.active ? 0 : 1;
        return this.save();
    }
}
