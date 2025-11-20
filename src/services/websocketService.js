import db from '../config/db.js';
import Relay from '../models/relay.js';
import { Server as IOServer } from 'socket.io';

class websocketService {
    constructor() {
        this.io = null;
    }

    initSocket(server) {
        if (this.io) return this.io;
        this.io = new IOServer(server, { cors: { origin: '*' } });
        this.io.on('connection', socket => {
            console.log('Socket connected', socket.id);
        });
    }

    broadcastUpdate() {
        if (!this.io) return;
        const rows = db.prepare('SELECT * FROM relays ORDER BY name').all();
        const relays = rows.map((row) => new Relay(row));
        this.io.emit('update', relays);
    }
}

const instance = new websocketService();
export default instance;
