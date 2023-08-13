import webSocket, { WebSocket } from 'ws';

const clients: { [userId: string]: WebSocket[] } = {};


export function broadcastMessageToUser(userId: string, message: object) {
    const userConnections = clients[userId];
    if (userConnections) {
        userConnections.forEach(connection => {
            if (connection.readyState === webSocket.OPEN) {
                connection.send(JSON.stringify(message));
            }
        });
    }
}


export function addClient(client: WebSocket, userId: string) {
    if (!clients[userId]) {
        clients[userId] = [];
    }

    clients[userId].push(client);
}

export function deleteClient(client: WebSocket, userId: string) {
    clients[userId] = clients[userId].filter(ws => ws !== client);
}