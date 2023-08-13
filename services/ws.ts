import webSocket, { WebSocket } from 'ws';

const clients: { [id: string]: WebSocket } = {};


export function broadcastMessage(message: object) {
    const data = JSON.stringify(message);
    for (const userId in clients) {
        const client = clients[userId];
        if (client.readyState === webSocket.OPEN) {
            client.send(data);
        }
    }
}



export function addClient(client: WebSocket, clientId: string) {
    clients[clientId] = client;
}

export function deleteClient(clientId: string) {
    delete clients[clientId];
}