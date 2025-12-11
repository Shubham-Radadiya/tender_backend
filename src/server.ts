import http from "http";
import App from "./app";
import { connectDb } from "./dbConnection";
import { initSocket } from "./socket";

import * as dotenv from "dotenv";
dotenv.config();

const serverPort = Number(process.env.PORT) || 3000;

connectDb()
  .then(async () => {
    App.start(serverPort);

    const httpServer = http.createServer(App.instance);
    initSocket(httpServer);

    httpServer.listen(serverPort, () => {
      console.log(
        `App listening on environment "${process.env.NODE_ENV}" ${serverPort}`
      );
    });
  })
  .catch((error) => {
    console.log("error while connect to database", error);
  });
