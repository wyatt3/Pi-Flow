import db from '../config/db.js';
import gpio from 'rpi-gpio';
import Schedule from './schedule.js';

const gpioEnabled = process.env.GPIO_ENABLED === 'true';
export default class Relay {
    constructor({ id = null, name, gpio_pin, active = 1 }) {

        this.id = id;
        this.name = name;
        this.gpio_pin = gpio_pin;
        this.active = active;

        if (gpioEnabled) {
            gpio.setMode(gpio.MODE_BCM);

            gpio.setup(this.gpio_pin, gpio.DIR_OUT, (err) => {
                if (err) {
                    console.error(`GPIO setup error on pin ${this.gpio_pin}`, err);
                    return;
                }

                gpio.write(this.gpio_pin, !!this.active, (err) => {
                    if (err) {
                        console.error(`GPIO write error on pin ${this.gpio_pin}`, err);
                    } else {
                        console.log(`Relay ${this.name} initialized → ${this.active ? 'ON' : 'OFF'}`);
                    }
                });
            });
        }

        const result = db
            .prepare('SELECT * FROM schedules WHERE relay_id = ?')
            .all(this.id);

        this.schedules = result.map((schedule) => new Schedule(schedule));
    }

    setValue(value, callback) {
        if (!gpioEnabled) return;

        const newValue = !!value;
        gpio.write(this.gpio_pin, newValue, (err) => {
            if (!err) this.active = newValue ? 1 : 0;
            if (callback) callback(err);
        });
    }
}
