import db from '../config/db.js';
import Relay from '../models/relay.js';
import RelayService from '../services/relayService.js';

export default class RelayController {
    static getAll(req, res) {
        const rows = db.prepare('SELECT * FROM relays ORDER BY id').all();
        const relays = rows.map((row) => {
            try {
                return new Relay(row)
            } catch (err) {
                return row
            }
        });
        return res.json(relays);
    }

    static create(req, res) {
        const { name, gpio_pin } = req.body;
        if (!name || gpio_pin == null) return res.status(400).json({ error: 'name & gpio_pin required' });
        const relay = RelayService.create(name, gpio_pin);
        res.json(relay);
    }

    static update(req, res) {
        const { id } = req.params;
        const result = db.prepare('SELECT * FROM relays WHERE id = ?').get(id);
        let relay = new Relay(result);
        relay = RelayService.save(relay, req.body.name, req.body.gpio_pin, Number(req.body.active));
        res.json(relay);
    }

    static delete(req, res) {
        const { id } = req.params;
        const result = db.prepare('SELECT * FROM relays WHERE id = ?').get(id);
        const relay = new Relay(result);
        RelayService.delete(relay);
        res.json({ status: 'ok' });
    }

}

