import App from "./app";
import { connectDb } from "./dbConnection";

import * as dotenv from "dotenv";
dotenv.config();

const serverPort = process.env.PORT || 3000;

connectDb()
  .then(async () => {
    App.start(serverPort);
    App.instance.listen(serverPort, function () {
      console.log(
        `App listening on environment "${process.env.NODE_ENV}" ${serverPort}`
      );
    });
  })
  .catch((error) => {
    console.log("error while connect to database", error);
  });