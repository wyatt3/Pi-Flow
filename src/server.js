import http from 'http';
import app from './app.js';
import { resetSchedules } from './services/scheduleService.js';
import websocketService from './services/websocketService.js';

const PORT = process.env.PORT || 8080;

const server = http.createServer(app);
console.log(server);
const wsService = new websocketService();
wsService.initSocket(server);

resetSchedules(() => {
    // websocketService.broadcastSchedules(require('./models/schedule.js').allSchedules());
    wsService.broadcastRelays(db.prepare('SELECT * FROM relays ORDER BY id').all());
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
