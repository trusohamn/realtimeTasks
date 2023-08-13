import express from "express";
import { config } from "dotenv";
import expressWs from "express-ws";
import webSocket, { WebSocket } from 'ws';
import usersRoute from './routes/users.js';
import cors from "cors";
import bodyParser from "body-parser";

import { getUsersList } from './db.js';
import { extractUserId, logRequest } from "./middlewares.js";

config();
const port = process.env.PORT;

const expressApp = express();
const { app } = expressWs(expressApp);

const clients: { [id: string]: WebSocket } = {};

const corsOptions = {
  origin: 'http://localhost:3000',
}

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(logRequest)
app.options('*', cors())

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.use('/api', usersRoute);

app.ws('/socket', async (ws, req) => {
  const userId = req.query['userid'] as string;

  if (!userId) ws.close(4000, 'UserId missing');
  console.log(`Recieved a new connection from`, userId);

  clients[userId] = ws;

  const userLists = await getUsersList(userId)
  console.log({ userLists })

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

app.post('/api/lists', extractUserId, (req, res) => {
  const userId = req.userId;
  // IN PROGRESS

});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
