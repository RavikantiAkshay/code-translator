import { Router } from "express";
import {
  handleTranslation,
  handleComplexityAnalysis,
  handleOptimization,
  handleExplanation,
} from "../controllers/code.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import { codeRateLimiter } from "../middleware/rateLimit.middleware.js";

const router = Router();

router.use(authenticate);
router.use(codeRateLimiter); // Protect code AI endpoints from bulk abuse

router.post("/translate", handleTranslation);
router.post("/complexity", handleComplexityAnalysis);
router.post("/optimize", handleOptimization);
router.post("/explain", handleExplanation);

export default router;
