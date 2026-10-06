import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Loads config/.env for local runs. On Vercel the variables come from the
// project settings and this file is simply absent.
const dir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(dir, ".env") });
