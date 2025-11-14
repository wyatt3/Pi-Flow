import * as Schedule from '../models/schedule.js';
import * as ScheduleService from '../services/scheduleService.js';
import Ws from '../services/websocketService.js';
import * as Relay from '../models/relay.js';

export function list(req, res) {
    res.json(Schedule.allSchedules());
}

export function create(req, res) {
    const { relay_id, start_time, duration_min } = req.body;

    if (!relay_id || !start_time || !duration_min) {
        return res.status(400).json({ error: 'relay_id, start_time, duration_min required' });
    }

    const relay = Relay.getRelay(relay_id);
    if (!relay) return res.status(400).json({ error: 'invalid relay_id' });

    const row = ScheduleService.scheduleRelay(
        {
            relay_id: Number(relay_id),
            start_time,
            duration_min: Number(duration_min)
        },
        () => {
            Ws.broadcastSchedules(Schedule.allSchedules());
            Ws.broadcastRelays(Relay.allRelays());
        }
    );

    Ws.broadcastSchedules(Schedule.allSchedules());
    res.json(row);
}

export function cancel(req, res) {
    const id = Number(req.params.id);

    ScheduleService.cancelSchedule(id, () => {
        Ws.broadcastSchedules(Schedule.allSchedules());
        Ws.broadcastRelays(Relay.allRelays());
    });

    res.json({ status: 'cancelled' });
}
