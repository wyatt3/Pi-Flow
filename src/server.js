import http from 'http';
import app from './app.js';
import { initGPIO } from './services/gpioService.js';
import { restoreSchedules } from './services/scheduleService.js';
import Ws from './services/websocketService.js';
import * as Relay from './models/relay.js';

const PORT = process.env.PORT || 8080;

const server = http.createServer(app);
Ws.initSocket(server);

// Initialize GPIO (throws if onoff fails)
initGPIO();

// Restore schedules and wire updates to broadcasts
restoreSchedules(() => {
    Ws.broadcastSchedules(require('./models/schedule.js').allSchedules());
    Ws.broadcastRelays(Relay.allRelays());
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down...');
    import('./services/gpioService.js')
        .then(mod => {
            mod.cleanup();
            process.exit(0);
        })
        .catch(() => process.exit(0));
});
