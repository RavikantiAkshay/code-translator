import rateLimit from "express-rate-limit";

// Rate limiter for code translation/analysis routes (max 20 requests per 15 minutes per IP)
export const codeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, 
  message: {
    success: false,
    message: "Too many compilation requests from this IP. Please wait 15 minutes before executing more actions.",
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// Rate limiter for authentication paths (max 30 registration/login requests per 15 minutes)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 30, 
  message: {
    success: false,
    message: "Too many authentication requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
