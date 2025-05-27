import App from "./app";
import { connectDb } from "./dbConnection";
import * as dotenv from "dotenv";

dotenv.config();

const serverPort = parseInt(process.env.PORT || "5000", 10);

connectDb()
  .then(async () => {
    // Initialize Express app
    const app = App.getInstance();

    // Start the server
    App.listen(serverPort);

    console.log(
      `Server running on port ${serverPort} (${process.env.NODE_ENV})`
    );
    console.log(`Socket.IO listening on path: /socket.io/`);
  })
  .catch((error) => {
    console.log("Error while connecting to database:", error);
  });
