import { Gpio } from 'onoff';
export class Relay {
    constructor({ id = null, name, gpio_pin, active = 0 }) {
        this.id = id;
        this.name = name;
        this.gpio_pin = gpio_pin;
        this.active = active;
        this.gpio = new Gpio(this.gpio_pin, 'out');
    }
}
