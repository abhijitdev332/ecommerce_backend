import app from "./app.js";
import Database from "./db/db.js";
import { errorLogger, logMessage } from "./utils/logger.js";
const db = new Database();
db.connect().catch((err) => {
  logMessage(errorLogger, "Failed to conneted with database", err?.message);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log("server is running", PORT);
});

process.on("unhandledRejection", (err) => {
  logMessage(errorLogger, err?.message);
  server.close(() => {
    process.exit(1);
  });
});
process.on("uncaughtException", (err) => {
  logMessage(errorLogger, err?.message);
  process.exit(1);
});
