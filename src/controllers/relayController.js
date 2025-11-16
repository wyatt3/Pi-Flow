import db from '../config/db.js';
import Relay from '../models/relay.js';
import RelayService from '../services/relayService.js';

export default class RelayController {
    static getAll(req, res) {
        const rows = db.prepare('SELECT * FROM relays ORDER BY name').all();
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
        try {
            const relay = RelayService.create(name, gpio_pin);
            return res.json(relay);
        } catch (err) {
            return res.status(400).json(err.message);
        }
    }

    static update(req, res) {
        const { id } = req.params;
        const result = db.prepare('SELECT * FROM relays WHERE id = ?').get(id);
        let relay = new Relay(result);
        try {
            relay = RelayService.save(relay, Number(req.body.active));
            return res.json(relay);
        } catch (err) {
            return res.status(400).json(err.message);
        }
    }

    static delete(req, res) {
        const { id } = req.params;
        const result = db.prepare('SELECT * FROM relays WHERE id = ?').get(id);
        const relay = new Relay(result);
        try {
            RelayService.delete(relay);
            return res.json({ status: 'ok' });
        } catch (err) {
            return res.status(400).json(err.message);
        }
    }

}

