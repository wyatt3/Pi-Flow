import express from 'express';
import relayRoutes from './routes/relayRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/relays', relayRoutes);
app.use('/api/schedules', scheduleRoutes);

// default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

export default app;
