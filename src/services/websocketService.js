import { Server as IOServer } from 'socket.io';

export default class websocketService {
    initSocket(server) {
        if (this.io) return this.io;
        this.io = new IOServer(server, { cors: { origin: '*' } });
        this.io.on('connection', socket => {
            console.log('Socket connected', socket.id);
        });
    }

    broadcastRelays(relays) {
        if (!this.io) return;
        this.io.emit('relays:update', relays);
    }

    broadcastSchedules(schedules) {
        if (!this.io) return;
        this.io.emit('schedules:update', schedules);
    }
}
