import { Gpio } from 'onoff';

const pinToLineMap = {
    2: 514,
    3: 515,
    4: 516,
    5: 517,
    6: 518,
    7: 519,
    8: 520,
    9: 521,
    10: 522,
    11: 523,
    12: 524,
    13: 525,
    14: 526,
    15: 527,
    16: 528,
    17: 529,
    18: 530,
    19: 531,
    20: 532,
    21: 533,
    22: 534,
    23: 535,
    24: 536,
    25: 537,
    26: 538,
    27: 539,
};

export default class Relay {
    constructor({ id = null, name, gpio_pin, active = 0 }) {
        const gpioEnabled = process.env.GPIO_ENABLED == 'true';
        this.id = id;
        this.name = name;
        this.gpio_pin = gpio_pin;
        this.active = active;
        this.gpio = gpioEnabled ? new Gpio(Relay.pinToLineMap[this.gpio_pin], 'out') : null;
        if (this.gpio) this.gpio.writeSync(this.active);
    }

    static get pinToLineMap() {
        return pinToLineMap;
    }
}
