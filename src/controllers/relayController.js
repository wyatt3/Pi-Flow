import db from '../config/db.js';
import Relay from '../models/relay.js';
import RelayService from '../services/relayService.js';
import Ws from '../services/websocketService.js';

export class RelayController {
    static getAll(req, res) {
        const rows = db.prepare('SELECT * FROM relays ORDER BY id').all();
        return res.json(rows.map(row => new Relay(row)));
    }

    static create(req, res) {
        const { name, gpio_pin } = req.body;
        if (!name || gpio_pin == null) return res.status(400).json({ error: 'name & gpio_pin required' });

        const relay = RelayService.create(name, gpio_pin);
        Ws.broadcastRelays(db.prepare('SELECT * FROM relays ORDER BY id').all());
        res.json(relay);
    }

    static update(req, res) {
        const { id } = req.params;
        const result = db.prepare('SELECT * FROM relays WHERE id = ?').run(id);
        let relay = new Relay(result);
        relay.name = req.body.name;
        relay = RelayService.save(relay);
        Ws.broadcastRelays(db.prepare('SELECT * FROM relays ORDER BY id').all());
        res.json(relay);
    }

    static delete(req, res) {
        const { id } = req.params;
        const result = db.prepare('SELECT * FROM relays WHERE id = ?').run(id);
        const relay = new Relay(result);
        RelayService.delete(relay);
        Ws.broadcastRelays(db.prepare('SELECT * FROM relays ORDER BY id').all());
        res.json({ status: 'ok' });
    }

}

