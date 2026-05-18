import { Router } from "express";
import authRoutes from "./auth.routes.js";
import translationRoutes from "./translation.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/translate", translationRoutes); // → /api/translate/...

export default router;
