import db from '../config/db.js';
import { GpioService } from '../services/gpioService.js';
import { Relay } from '../models/relay.js';
import { RelayService } from '../services/relayService.js';
import Ws from '../services/websocketService.js';

// export function list(req, res) {
//     const relays = Relay.allRelays();
//     res.json(relays);
// }

// export function create(req, res) {
//     const { name, gpio_pin } = req.body;
//     if (!name || gpio_pin == null) return res.status(400).json({ error: 'name & gpio_pin required' });

//     const relay = Relay.createRelay(name, Number(gpio_pin));
//     GpioService.attachRelay(relay);
//     Ws.broadcastRelays(Relay.allRelays());
//     res.json(relay);
// }

// export function manualToggle(req, res) {
//     const { id, action } = req.params;
//     const relay = Relay.getRelay(id);

//     if (!relay) return res.status(404).json({ error: 'relay not found' });

//     const on = action === 'on';

//     try {
//         GpioService.setRelayState(id, on);
//         Relay.setRelayActive(id, on ? 1 : 0);
//         Ws.broadcastRelays(Relay.allRelays());
//         res.json({ status: 'ok' });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// }


export class RelayController {
    static getAll(req, res) {
        return db.prepare('SELECT * FROM relays ORDER BY id').all().then(rows => res.json(rows.map(row => new Relay(row))));
    }

    static create(req, res) {
        const { name, gpio_pin } = req.body;
        if (!name || gpio_pin == null) return res.status(400).json({ error: 'name & gpio_pin required' });

        const relay = RelayService.create({ name, gpio_pin });
        // Ws.broadcastRelays(Relay.allRelays());
        res.json(relay);
    }

}

// Get relay by ID
// static async findById(id) {
//     const db = await getDB();
//     const row = await db.get(`SELECT * FROM relays WHERE id = ?`, [id]);
//     return row ? new Relay(row) : null;
// }

// Get all relays

