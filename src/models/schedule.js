import db from "../config/db.js";

export default class Schedule {
    constructor({ id = null, relay_id, start_time, duration_min, one_time, status, skip_next }) {
        this.id = id;
        this.relay_id = relay_id;
        this.start_time = start_time;
        this.duration_min = duration_min;
        this.one_time = one_time;
        this.status = status;
        this.skip_next = skip_next;
        this.days = db.prepare('SELECT * FROM schedule_days WHERE schedule_id = ?').all(this.id);
    }
}
