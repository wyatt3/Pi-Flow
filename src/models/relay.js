import { Chip, Line } from 'node-libgpiod'
import db from '../config/db.js';
import Schedule from './schedule.js';

export default class Relay {
    constructor({ id = null, name, gpio_pin, active = 1 }) {
        const gpioEnabled = process.env.GPIO_ENABLED == 'true';
        this.id = id;
        this.name = name;
        this.gpio_pin = gpio_pin;
        this.active = active;
        if (gpioEnabled) {
            const chip = new Chip(0);
            this.gpio = new Line(chip, this.gpio_pin);
            this.gpio.requestOutputMode();
            this.gpio.setValue(this.active);
        } else {
            this.gpio = null;
        }
        const result = db.prepare('SELECT * FROM schedules WHERE relay_id = ?').all(this.id);
        this.schedules = result.map((schedule) => new Schedule(schedule));
    }
}
