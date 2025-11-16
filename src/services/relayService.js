import db from '../config/db.js';
import Relay from '../models/relay.js';
import websocketService from '../services/websocketService.js';


export default class RelayService {
    static create(name, gpio_pin) {
        const result = db.prepare(
            `INSERT INTO relays (name, gpio_pin, active)
       VALUES (?, ?, 0)`
        ).run(name, gpio_pin);
        websocketService.broadcastRelays();
        return new Relay({ id: result.lastInsertRowid, name, gpio_pin });
    }

    static save(relay, name, gpio_pin, active) {
        db.prepare(
            `UPDATE relays SET name = ?, gpio_pin = ?, active = ?
       WHERE id = ?`,
        ).run(name, gpio_pin, active, relay.id);
        if (relay.gpio) relay.gpio.writeSync(relay.active);
        websocketService.broadcastRelays();
        return relay;
    }

    static delete(relay) {
        if (relay.gpio) relay.gpio.writeSync(0);
        // delete schedules
        db.prepare(`DELETE FROM relays WHERE id = ?`).run(relay.id);
        websocketService.broadcastRelays();
    }
}
