import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/config/db.config.js";
import { startWorker } from "./src/worker.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    // Start background BullMQ verification worker
    try {
      startWorker();
    } catch (workerErr) {
      console.warn("Notice: BullMQ background worker could not start (Redis offline?):", workerErr.message);
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
