import db from '../config/db.js';
import Relay from '../models/relay.js';


export default class RelayService {
    static create(name, gpio_pin) {
        const result = db.prepare(
            `INSERT INTO relays (name, gpio_pin, active)
       VALUES (?, ?, 0)`
        ).run(name, gpio_pin);
        return new Relay(result);
    }

    static save(relay) {
        db.prepare(
            `UPDATE relays SET name = ?, gpio_pin = ?, active = ?
       WHERE id = ?`,
        ).run(relay.name, relay.gpio_pin, relay.active, relay.id)
        if (relay.gpio) relay.gpio.writeSync(relay.active);
        return relay;
    }

    static delete(relay) {
        if (relay.gpio) relay.gpio.writeSync(0);
        // delete schedules
        db.prepare(`DELETE FROM relays WHERE id = ?`).run(relay.id);
    }
}
