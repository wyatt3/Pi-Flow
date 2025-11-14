import { Gpio } from 'onoff';
import db from '../config/db.js';


// Manage Gpio objects keyed by relay id
const gpioMap = new Map();


export function initGPIO() {
    const rows = db.prepare('SELECT * FROM relays').all();
    rows.forEach(r => {
        try {
            const g = new Gpio(r.gpio_pin, 'out');
            g.writeSync(r.active ? 1 : 0);
            gpioMap.set(r.id, g);
            console.log(`Initialized GPIO pin ${r.gpio_pin} for relay ${r.id}`);
        } catch (err) {
            console.error('Failed to initialize GPIO for relay', r.id, err.message);
            throw err;
        }
    });
}


export function attachRelay(relay) {
    // relay: { id, gpio_pin, active }
    if (gpioMap.has(relay.id)) return;
    const g = new Gpio(relay.gpio_pin, 'out');
    g.writeSync(relay.active ? 1 : 0);
    gpioMap.set(relay.id, g);
}


export function setRelayState(relayId, on) {
    const g = gpioMap.get(Number(relayId));
    if (!g) throw new Error('GPIO object not found for relay ' + relayId);
    g.writeSync(on ? 1 : 0);
}


export function cleanup() {
    for (const g of gpioMap.values()) {
        try { g.writeSync(0); g.unexport(); } catch (e) { }
    }
}
