import db from '../config/db.js';
import Relay from '../models/relay.js';
export default class ScheduleController {
    static create(req, res) {
        const { relay_id, start_time, duration_min, one_time } = req.body;

        if (!relay_id || !start_time || !duration_min) {
            return res.status(400).json({ error: 'relay_id, start_time, duration_min required' });
        }

        const result = db.prepare('SELECT * FROM relays WHERE id = ?').get(relay_id);
        const relay = new Relay(result);
        if (!relay) return res.status(400).json({ error: 'invalid relay_id' });
    }
}
