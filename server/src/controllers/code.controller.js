import * as geminiService from "../services/gemini.service.js";
import * as historyService from "../services/history.service.js";
import { addTranslationJob, getJobById, queueEvents } from "../queue/translation.queue.js";

/**
 * Synchronous legacy translation endpoint (kept for quick backward compatibility)
 */
export const handleTranslation = async (req, res, next) => {
  try {
    const { code, sourceLanguage, targetLanguage } = req.body;
    const userId = req.user._id;

    if (!code || !sourceLanguage || !targetLanguage) {
      return res.status(400).json({
        success: false,
        message: "Code, sourceLanguage, and targetLanguage are required.",
      });
    }

    const result = await geminiService.translateCode(code, sourceLanguage, targetLanguage);
    
    // Automatically save to history
    await historyService.createHistory(
      userId,
      "translate",
      sourceLanguage,
      targetLanguage,
      code,
      result
    );

    return res.json({ success: true, data: { result } });
  } catch (error) {
    next(error);
  }
};

/**
 * Asynchronous job queue translation + verification endpoint
 * Decouples request ingestion from execution and returns 202 Accepted.
 */
export const handleAsyncTranslation = async (req, res, next) => {
  try {
    const { code, sourceLanguage, targetLanguage } = req.body;
    const userId = req.user?._id ? req.user._id.toString() : null;

    if (!code || !sourceLanguage || !targetLanguage) {
      return res.status(400).json({
        success: false,
        message: "Code, sourceLanguage, and targetLanguage are required.",
      });
    }

    const job = await addTranslationJob({
      userId,
      code,
      sourceLanguage,
      targetLanguage,
    });

    return res.status(202).json({
      success: true,
      message: "Translation and verification job enqueued successfully.",
      data: {
        jobId: job.id,
        status: "QUEUED",
        streamUrl: `/api/code/jobs/${job.id}/events`,
        statusUrl: `/api/code/jobs/${job.id}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Query status of an asynchronous job
 */
export const handleJobStatus = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const jobInfo = await getJobById(jobId);

    if (!jobInfo) {
      return res.status(404).json({
        success: false,
        message: `Job ${jobId} not found or expired.`,
      });
    }

    return res.json({
      success: true,
      data: jobInfo,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Server-Sent Events (SSE) stream for real-time job progress & terminal output
 */
export const handleJobSSEEvents = async (req, res) => {
  const { jobId } = req.params;

  // Set standard SSE streaming headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  // 1. Initial State Check
  const currentJob = await getJobById(jobId);
  if (!currentJob) {
    sendEvent("error", { message: "Job not found" });
    return res.end();
  }

  sendEvent("state", currentJob);

  if (currentJob.state === "completed" || currentJob.state === "failed") {
    sendEvent(currentJob.state, currentJob);
    return res.end();
  }

  // 2. Listen to BullMQ QueueEvents
  const onProgress = ({ jobId: eventJobId, data }) => {
    if (eventJobId === jobId) {
      sendEvent("progress", data);
    }
  };

  const onCompleted = async ({ jobId: eventJobId, returnvalue }) => {
    if (eventJobId === jobId) {
      let parsed = returnvalue;
      if (typeof returnvalue === "string") {
        try { parsed = JSON.parse(returnvalue); } catch (_) {}
      }
      sendEvent("completed", { returnvalue: parsed });
      cleanup();
      res.end();
    }
  };

  const onFailed = ({ jobId: eventJobId, failedReason }) => {
    if (eventJobId === jobId) {
      sendEvent("failed", { failedReason });
      cleanup();
      res.end();
    }
  };

  const cleanup = () => {
    queueEvents.removeListener("progress", onProgress);
    queueEvents.removeListener("completed", onCompleted);
    queueEvents.removeListener("failed", onFailed);
  };

  queueEvents.on("progress", onProgress);
  queueEvents.on("completed", onCompleted);
  queueEvents.on("failed", onFailed);

  // Clean up if the client disconnects or closes the tab
  req.on("close", () => {
    cleanup();
  });
};

export const handleComplexityAnalysis = async (req, res, next) => {
  try {
    const { code, language } = req.body;
    const userId = req.user._id;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: "Code and language are required.",
      });
    }

    const result = await geminiService.analyzeCodeComplexity(code, language);

    // Automatically save to history
    await historyService.createHistory(
      userId,
      "analyze",
      language,
      null,
      code,
      result
    );

    return res.json({ success: true, data: { result } });
  } catch (error) {
    next(error);
  }
};

export const handleOptimization = async (req, res, next) => {
  try {
    const { code, language } = req.body;
    const userId = req.user._id;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: "Code and language are required.",
      });
    }

    const result = await geminiService.optimizeCode(code, language);

    // Automatically save to history
    await historyService.createHistory(
      userId,
      "optimize",
      language,
      null,
      code,
      result
    );

    return res.json({ success: true, data: { result } });
  } catch (error) {
    next(error);
  }
};

export const handleExplanation = async (req, res, next) => {
  try {
    const { code, language } = req.body;
    const userId = req.user._id;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: "Code and language are required.",
      });
    }

    const result = await geminiService.explainCode(code, language);

    // Automatically save to history
    await historyService.createHistory(
      userId,
      "explain",
      language,
      null,
      code,
      result
    );

    return res.json({ success: true, data: { result } });
  } catch (error) {
    next(error);
  }
};
