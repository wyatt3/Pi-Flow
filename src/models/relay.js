import { Gpio } from 'onoff';
export default class Relay {
    constructor({ id = null, name, gpio_pin, active = 0 }) {
        const gpioEnabled = process.env.GPIO_ENABLED == true;
        this.id = id;
        this.name = name;
        this.gpio_pin = gpio_pin;
        this.active = active;
        this.gpio = gpioEnabled ? new Gpio(this.gpio_pin, 'out') : null;
    }
}
