import * as Relay from '../models/relay.js';
import * as GpioService from '../services/gpioService.js';
import Ws from '../services/websocketService.js';

export function list(req, res) {
    const relays = Relay.allRelays();
    res.json(relays);
}

export function create(req, res) {
    const { name, gpio_pin } = req.body;
    if (!name || gpio_pin == null) return res.status(400).json({ error: 'name & gpio_pin required' });

    const relay = Relay.createRelay(name, Number(gpio_pin));
    GpioService.attachRelay(relay);
    Ws.broadcastRelays(Relay.allRelays());
    res.json(relay);
}

export function manualToggle(req, res) {
    const { id, action } = req.params;
    const relay = Relay.getRelay(id);

    if (!relay) return res.status(404).json({ error: 'relay not found' });

    const on = action === 'on';

    try {
        GpioService.setRelayState(id, on);
        Relay.setRelayActive(id, on ? 1 : 0);
        Ws.broadcastRelays(Relay.allRelays());
        res.json({ status: 'ok' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
