import express from "express";
import { config } from "dotenv";
import expressWs from "express-ws";
import usersRoute from './routes/users.js';
import listsRoute from './routes/lists.js';
import cors from "cors";
import bodyParser from "body-parser";

import { getUsersList } from './db.js';
import { logRequest } from "./middlewares.js";
import { addClient, broadcastMessage, deleteClient } from "./ws.js";

config();
const port = process.env.PORT;

const expressApp = express();
const { app } = expressWs(expressApp);

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
app.use('/api', listsRoute);

app.ws('/socket', async (ws, req) => {
  const userId = req.query['userid'] as string;

  if (!userId) ws.close(4000, 'UserId missing');
  console.log(`Recieved a new connection from`, userId);


  addClient(ws, userId) // TODO maybe use clientId, not userId, to enable multiple connections from the same user
  const userLists = await getUsersList(userId)

  console.log({ userLists })

  userLists.forEach((list) => {
    const message = {
      type: 'NEW_LIST',
      data: { list }
    }
    ws.send(JSON.stringify(message))
  })

  ws.on('message', (msg) => {
    console.log({ msg })
    const newMessage = { ...JSON.parse((msg as unknown as string)), server: new Date().toISOString(), fromClient: userId }

    broadcastMessage(newMessage)
  });



  ws.on('close', () => {
    console.log(`${userId} disconnected.`);
    deleteClient(userId) // TODO maybe use clientId, not userId
  })

});




app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
