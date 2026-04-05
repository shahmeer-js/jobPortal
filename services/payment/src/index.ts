import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { logger } from "./utils/monitoring.js";

const PORT = process.env.PORT;

app.listen(PORT, () => {
  logger.info(`Payment Service running on port ${PORT}`);
});
