import http from 'http';
import websocketService from './services/websocketService.js';
import express from 'express';
import routes from './routes/api.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import RelayService from './services/relayService.js';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api', routes);
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const PORT = process.env.PORT || 8080;
const server = http.createServer(app);
websocketService.initSocket(server);

// resetSchedules(() => {
//     // websocketService.broadcastSchedules(require('./models/schedule.js').allSchedules());
//     wsService.broadcastRelays(db.prepare('SELECT * FROM relays ORDER BY id').all());
// });

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
});

// when the serer quits, shut off all relays
process.on('SIGINT', () => {
    RelayService.turnOffAllRelays();
    process.exit(0);
});
