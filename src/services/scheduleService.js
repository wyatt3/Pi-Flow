import db from '../config/db.js';
import moment from 'moment-timezone';
import Relay from '../models/relay.js';
import Schedule from '../models/schedule.js';

export default class ScheduleService {
    static createSchedule(relay, start_time, duration_min, one_time, days) {
        const result = db.prepare(
            `INSERT INTO schedules (relay_id, start_time, duration_min, one_time)
            VALUES (?, ?, ?, ?)`
        ).run(relay.id, start_time, duration_min, one_time);
        const schedule = new Schedule({ id: result.lastInsertRowid, relay_id: relay.id, start_time, duration_min, one_time, status: 'scheduled' });
        ScheduleService.setDays(schedule, days);
        return schedule;
    }

    static updateSchedule(schedule, relay, start_time, duration_min, one_time, days) { }

    static setDays(schedule, days) {
        days.foreach((day) => {
            db.prepare(
                `INSERT INTO schedule_days (schedule_id, day)
                VALUES (?, ?)`
            ).run(schedule.id, day);
        })
        return;
    }

    static deleteSchedule(schedule) {
        db.prepare(
            `DELETE FROM schedules WHERE id = ?`
        ).run(schedule.id);
        db.prepare(
            `DELETE FROM schedule_days WHERE schedule_id = ?`
        ).run(schedule.id);
    }

    static skipNextOccurrence(schedule) {
        db.prepare(
            `UPDATE schedules SET skip_next = 1 WHERE id = ?`
        ).run(schedule.id);
    }

    static runSchedules() {
        const timezone = process.env.TIMEZONE;
        const currentTime = moment().tz(timezone);
        const currentDay = currentTime.day();
        const result = db.prepare(`SELECT * FROM schedules WHERE start_time = ?`).all(currentTime.format('HH:mm'));
        const schedules = result.map((schedule) => new Schedule(schedule));
        schedules.forEach((schedule) => {
            if (schedule.days.includes(currentDay)) {
                ScheduleService.runSchedule(schedule);
            }
        });
    }

    static runSchedule(schedule) {
        const result = db.prepare(
            `SELECT * FROM relays WHERE id = ?`
        ).run(schedule.relay_id);
        const relay = new Relay(result);
        RelayService.save(relay, 0);
        db.prepare(
            `UPDATE schedules SET status = ? WHERE id = ?`
        ).run('running', schedule.id);
        const timeout = schedule.duration_min * 60 * 1000;
        setTimeout(() => {
            RelayService.save(relay, 1);
            db.prepare(
                `UPDATE schedules SET status = ? WHERE id = ?`
            ).run('idle', schedule.id);
        }, timeout);
    }
}
