import { Server as IOServer } from 'socket.io';

let io = null;

export function initSocket(server) {
    io = new IOServer(server, { cors: { origin: '*' } });
    io.on('connection', socket => {
        console.log('Socket connected', socket.id);
    });
}


export function broadcastRelays(relays) {
    if (!io) return;
    io.emit('relays:update', relays);
}


export function broadcastSchedules(schedules) {
    if (!io) return;
    io.emit('schedules:update', schedules);
}


export default { initSocket, broadcastRelays, broadcastSchedules };
