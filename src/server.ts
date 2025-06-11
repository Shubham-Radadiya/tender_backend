import App from "./app";
import { connectDb } from "./dbConnection";
import * as dotenv from "dotenv";

dotenv.config();

const serverPort = parseInt(process.env.PORT || "5000", 10);

// Check required environment variables
const requiredEnvVars = ["DB_URL", "AES_KEY", "JWT_SECRET", "COOKIE_SECRET"];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  console.error(
    "❌ Missing required environment variables:",
    missingEnvVars.join(", ")
  );
  process.exit(1);
}

console.log("🔧 Starting server with configuration:");
console.log(`📡 Port: ${serverPort}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);

connectDb()
  .then(async () => {
    try {
      // Initialize Express app
      const app = App.getInstance();

      // Start the server
      App.listen(serverPort);

      console.log("✅ Server started successfully");
      console.log(`🌐 HTTP Server running on http://localhost:${serverPort}`);
      console.log(`🔌 Socket.IO listening on path: /socket.io/`);
    } catch (error) {
      console.error("❌ Error starting server:", error);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("❌ Error connecting to database:", error);
    process.exit(1);
  });
