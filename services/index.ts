import express from "express";
import { config } from "dotenv";
import expressWs from "express-ws";

config();

const expressApp = express();
const port = process.env.PORT;
const { app } = expressWs(expressApp);

app.get("/", (req, res) => {
  res.send("Hello");
});

app.ws('/socket', function (ws, req) {
  ws.on('message', function (msg) {
    console.log({ msg })


    ws.send(JSON.stringify({ ...JSON.parse((msg as unknown as string)), server: new Date().toISOString() }));
  });

});



app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
