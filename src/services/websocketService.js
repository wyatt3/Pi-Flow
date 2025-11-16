import { Server as IOServer } from 'socket.io';
import db from '../config/db.js';

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

    broadcastRelays() {
        if (!this.io) return;
        const relays = db.prepare('SELECT * FROM relays ORDER BY id').all();
        this.io.emit('relays:update', relays);
    }

    broadcastSchedules() {
        if (!this.io) return;
        const schedules = db.prepare('SELECT * FROM schedules ORDER BY id').all();
        this.io.emit('schedules:update', schedules);
    }
}

const instance = new websocketService();
export default instance;
