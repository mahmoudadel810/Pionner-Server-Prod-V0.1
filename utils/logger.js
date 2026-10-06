import path from "path";
import fs from "fs";
import winston from "winston";
import { fileURLToPath } from "url";

const transports = [new winston.transports.Console()];

// Vercel's filesystem is read-only, so file logs are only written locally
if (!process.env.VERCEL && process.env.NODE_ENV !== "production") {
  const logDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../logs");
  fs.mkdirSync(logDir, { recursive: true });

  transports.push(
    new winston.transports.File({ filename: path.join(logDir, "error.log"), level: "error" }),
    new winston.transports.File({ filename: path.join(logDir, "combined.log") })
  );
}

// Lets calls like logger.error("Upload failed:", err.message) keep the second argument
const appendArgs = winston.format((info) => {
  const extra = (info[Symbol.for("splat")] || []).filter((arg) => arg === null || typeof arg !== "object");
  if (extra.length) {
    info.message = [info.message, ...extra.map(String)].join(" ");
  }
  return info;
});

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(appendArgs(), winston.format.json()),
  transports,
});

export default logger;
