import db from '../config/db.js';
import { setRelayState } from './gpioService.js';


// map scheduleId => { startTimer, stopTimer }
const timers = new Map();


function msUntil(date) {
    return new Date(date).getTime() - Date.now();
}

export function resetSchedules(onUpdate) {
    const rows = db.prepare("SELECT * FROM schedules WHERE status IN ('scheduled','running') ORDER BY start_time").all();
    rows.forEach(r => {
        // mark running schedules as scheduled so we reschedule properly
        db.prepare("UPDATE schedules SET status = 'scheduled' WHERE id = ?").run(r.id);
        scheduleFromRow(r, onUpdate);
    });
}


export function scheduleRelay({ relay_id, start_time, duration_min }, onUpdate) {
    const info = db.prepare('INSERT INTO schedules (relay_id, start_time, duration_min, status) VALUES (?, ?, ?, "scheduled")').run(relay_id, start_time, duration_min);
    const row = db.prepare('SELECT * FROM schedules WHERE id = ?').get(info.lastInsertRowid);
    scheduleFromRow(row, onUpdate);
    if (onUpdate) onUpdate();
    return row;
}


function scheduleFromRow(row, onUpdate) {
    const sid = row.id;
    const startMs = new Date(row.start_time).getTime();
    const durationMs = Number(row.duration_min) * 60 * 1000;
    const now = Date.now();


    if (startMs + durationMs <= now) {
        db.prepare('UPDATE schedules SET status = "finished" WHERE id = ?').run(sid);
        if (onUpdate) onUpdate();
        return;
    }


    if (startMs <= now && startMs + durationMs > now) {
        // start immediately and schedule stop
        startSchedule(row);
        const timeLeft = startMs + durationMs - now;
        const stopTimer = setTimeout(() => stopSchedule(row, onUpdate), timeLeft);
        timers.set(sid, { stopTimer });
        return;
    }


    const startTimer = setTimeout(() => {
        startSchedule(row);
        const stopTimer = setTimeout(() => stopSchedule(row, onUpdate), durationMs);
        timers.set(sid, { stopTimer });
        if (onUpdate) onUpdate();
    }, startMs - now);


    timers.set(sid, { startTimer });
}


function startSchedule(row) {
    try {
        setRelayState(row.relay_id, true);
        db.prepare('UPDATE schedules SET status = "running" WHERE id = ?').run(row.id);
        db.prepare('UPDATE relays SET active = 1 WHERE id = ?').run(row.relay_id);
        console.log('Started schedule', row.id);
    } catch (err) {
        console.error('Failed to start schedule', row.id, err.message);
        db.prepare('UPDATE schedules SET status = "cancelled" WHERE id = ?').run(row.id);
    }
}


function stopSchedule(row, onUpdate) {
    try {
        setRelayState(row.relay_id, false);
        db.prepare('UPDATE schedules SET status = "finished" WHERE id = ?').run(row.id);
        db.prepare('UPDATE relays SET active = 0 WHERE id = ?').run(row.relay_id);
        console.log('Stopped schedule', row.id);
    } catch (err) {
        console.error('Failed to stop schedule', row.id, err.message);
    } finally {
        timers.delete(row.id);
        if (onUpdate) onUpdate();
    }
}


export function cancelSchedule(scheduleId, onUpdate) {
    const t = timers.get(Number(scheduleId));
    if (t) {
        if (t.startTimer) clearTimeout(t.startTimer);
        if (t.stopTimer) clearTimeout(t.stopTimer);
        timers.delete(Number(scheduleId));
    }
    db.prepare('UPDATE schedules SET status = "cancelled" WHERE id = ?').run(scheduleId);
    if (onUpdate) onUpdate();
}
