import { Router } from "express";
import {
  handleTranslation,
  handleComplexityAnalysis,
  handleOptimization,
  handleExplanation,
} from "../controllers/translation.controller.js";
import authenticate from "../middleware/auth.middleware.js";

const router = Router();

// Protect all AI routes so only logged-in users can use them
router.use(authenticate);

router.post("/translate", handleTranslation);
router.post("/complexity", handleComplexityAnalysis);
router.post("/optimize", handleOptimization);
router.post("/explain", handleExplanation);

export default router;
