import { Router } from "express";
import {
  handleTranslation,
  handleAsyncTranslation,
  handleJobStatus,
  handleJobSSEEvents,
  handleComplexityAnalysis,
  handleOptimization,
  handleExplanation,
} from "../controllers/code.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import { codeRateLimiter } from "../middleware/rateLimit.middleware.js";

const router = Router();

router.use(authenticate);

// SSE stream should bypass standard JSON rate limiting to stay connected
router.get("/jobs/:jobId/events", handleJobSSEEvents);
router.get("/jobs/:jobId", handleJobStatus);

// Rate-limited AI execution endpoints
router.use(codeRateLimiter);

router.post("/translate", handleTranslation);
router.post("/translate-verify", handleAsyncTranslation);
router.post("/complexity", handleComplexityAnalysis);
router.post("/optimize", handleOptimization);
router.post("/explain", handleExplanation);

export default router;
