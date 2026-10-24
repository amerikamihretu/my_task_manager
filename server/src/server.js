import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const requiredEnvironment = [
  "PORT",
  "MONGO_URI",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "SESSION_COOKIE_MAX_AGE_MS",
  "CLIENT_ORIGIN",
];

const missingEnvironment = requiredEnvironment.filter(
  (name) => !process.env[name],
);

if (missingEnvironment.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvironment.join(", ")}. Check server/.env.`,
  );
}

const PORT = process.env.PORT;

async function start() {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`[server] Listening on http://localhost:${PORT}`);
      console.log(`[server] Health check: http://localhost:${PORT}/api/health`);
    });

    const shutdown = async (signal) => {
      console.log(`\n[server] ${signal} received. Shutting down...`);
      server.close(async () => {
        await mongoose.connection.close();
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("[server] Failed to start:", error.message);
    process.exit(1);
  }
}

start();
