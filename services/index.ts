import express from "express";
import { config } from "dotenv";
import expressWs from "express-ws";
import usersRoute from './routes/users.js';
import listsRoute from './routes/lists.js';
import cors from "cors";
import bodyParser from "body-parser";

import { createTask, getUsersIdByListId, getUsersListIds } from './db.js';
import { logRequest } from "./middlewares.js";
import { addClient, broadcastMessageToUser, deleteClient } from "./ws.js";

config();
const port = process.env.PORT;

const expressApp = express();
const { app } = expressWs(expressApp);

// TODO setup switch for prod
const corsOptions = {
  origin: 'http://localhost:3000',
}

app.use(cors());
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

  if (!userId) return ws.close(4000, 'UserId missing');
  console.log(`Recieved a new connection from`, userId);


  addClient(ws, userId)
  const userLists = await getUsersListIds(userId)

  userLists.forEach((list) => {
    const message = {
      type: 'NEW_LIST',
      data: { list }
    }
    ws.send(JSON.stringify(message))
  })

  ws.on('message', async (msg) => {
    const message = JSON.parse((msg as unknown as string))
    if (message.type === 'NEW_TASK') {
      const listIdAffectedByMessage = message.listId
      const usersAffectedByMessage = await getUsersIdByListId(listIdAffectedByMessage)


      const newMessage = { ...message, fromClient: userId }
      usersAffectedByMessage.forEach(({ userId }) => broadcastMessageToUser(userId, newMessage))
      const { task } = message.data

      await createTask(listIdAffectedByMessage, task.id, task.text);
    }
  });



  ws.on('close', () => {
    console.log(`${userId} disconnected.`);
    deleteClient(ws, userId)
  })

});




app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
