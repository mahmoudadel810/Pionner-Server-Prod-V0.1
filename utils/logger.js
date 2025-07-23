// Logger configuration: uses file logging locally, but only console logging on Vercel/production (serverless). Vercel's filesystem is read-only except for /tmp, so we avoid writing to project-root logs/ in production.
import path from 'path';
import winston from 'winston';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isVercel = !!process.env.VERCEL || process.env.NODE_ENV === 'production';

let logDir;
if (isVercel) {
  logDir = '/tmp/logs';
  // Optionally create /tmp/logs if file logging is ever enabled
  // if (!fs.existsSync(logDir)) {
  //   fs.mkdirSync(logDir, { recursive: true });
  // }
} else {
  logDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

const transports = [
  new winston.transports.Console(),
];

if (!isVercel) {
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
    })
  );
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports,
});

export default logger;