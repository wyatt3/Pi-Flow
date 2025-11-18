import db from '../config/db.js';
import Relay from '../models/relay.js';
import Schedule from '../models/schedule.js';
import ScheduleService from '../services/scheduleService.js';

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

    static update(req, res) {
        const { id } = req.params;
        const { start_time, duration_min, one_time, days } = req.body;

        const result = db.prepare('SELECT * FROM schedules WHERE id = ?').get(id);
        const schedule = new Schedule(result);
        try {
            ScheduleService.updateSchedule(schedule, start_time, duration_min, one_time, days);
            return res.status(200);
        } catch (err) {
            return res.status(400).json(err.message);
        }
    }

    static delete(req, res) {
        const { id } = req.params;
        const result = db.prepare('SELECT * FROM schedules WHERE id = ?').get(id);
        const schedule = new Schedule(result);
        try {
            ScheduleService.deleteSchedule(schedule);
            return res.status(204);
        } catch (err) {
            return res.status(400).json(err.message);
        }
    }
}
