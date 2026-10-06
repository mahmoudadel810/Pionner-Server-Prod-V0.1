import "./config/env.js";
import { createApp } from "./App/initApp.js";
import connectDB from "./DB/connection.js";
import logger from "./utils/logger.js";

const app = createApp();

if (!process.env.VERCEL) {
   const port = process.env.PORT || 8000;

   connectDB().catch((error) => {
      logger.error(`Could not connect to MongoDB: ${error.message}`);
      process.exit(1);
   });

   const server = app.listen(port, () => {
      logger.info(`Server running on port ${port} in ${process.env.NODE_ENV || "development"} mode`);
   });

   const shutdown = () => {
      logger.info("Shutting down");
      server.close(() => process.exit(0));
   };
   process.on("SIGTERM", shutdown);
   process.on("SIGINT", shutdown);
}

export default app;
