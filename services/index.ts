import express from "express";
import { config } from "dotenv";
import expressWs from "express-ws";
import webSocket, { WebSocket } from 'ws';

config();

const expressApp = express();
const port = process.env.PORT;
const { app } = expressWs(expressApp);

const clients: { [id: string]: WebSocket } = {};



app.get("/", (req, res) => {
  res.send("Hello");
});

app.ws('/socket', (ws) => {


  const userId = (new Date()).getTime()
  console.log(`Recieved a new connection.`, userId);

  clients[userId] = ws;

  ws.on('message', (msg) => {
    console.log({ msg })
    const newMessage = { ...JSON.parse((msg as unknown as string)), server: new Date().toISOString(), fromClient: userId }

    const data = JSON.stringify(newMessage);
    for (let userId in clients) {
      let client = clients[userId];
      if (client.readyState === webSocket.OPEN) {
        client.send(data);
      }

    };
  });

  ws.on('close', () => {
    console.log(`${userId} disconnected.`);
    delete clients[userId];
  })

});



app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
