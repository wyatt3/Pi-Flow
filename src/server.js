import http from 'http';
import app from './app.js';
import { resetSchedules } from './services/scheduleService.js';
import Ws from './services/websocketService.js';

const PORT = process.env.PORT || 8080;

const server = http.createServer(app);
Ws.initSocket(server);

// Restore schedules and wire updates to broadcasts
resetSchedules(() => {
    Ws.broadcastSchedules(require('./models/schedule.js').allSchedules());
    Ws.broadcastRelays(db.prepare('SELECT * FROM relays ORDER BY id').all());
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
