import { EventEmitter } from "events";
import crypto from "crypto";
import { redisConnection } from "../config/redis.config.js";

export const QUEUE_NAME = "code-translation-queue";

// In-Memory Resilient Queue Storage & Event Emitter
const inMemoryJobs = new Map();
class MemoryQueueEvents extends EventEmitter {}
export const queueEvents = new MemoryQueueEvents();

let memoryProcessor = null;

export const registerWorkerProcessor = (processor) => {
  memoryProcessor = processor;
};

/**
 * Add a new translation task to the async queue.
 * Automatically handles asynchronous job execution and progress tracking.
 */
export const addTranslationJob = async ({ userId, code, sourceLanguage, targetLanguage }) => {
  const jobId = crypto.randomUUID();
  const job = {
    id: jobId,
    name: "translate-and-verify",
    data: {
      userId,
      code,
      sourceLanguage,
      targetLanguage,
      submittedAt: new Date().toISOString(),
    },
    progress: { percent: 10, stage: "QUEUED", message: "Job enqueued in async worker queue" },
    state: "waiting",
    returnvalue: null,
    failedReason: null,
    updateProgress: async (progressData) => {
      job.progress = progressData;
      queueEvents.emit("progress", { jobId, data: progressData });
    },
  };

  inMemoryJobs.set(jobId, job);

  // Trigger background processor asynchronously (non-blocking)
  setImmediate(async () => {
    if (!memoryProcessor) {
      console.warn("[Queue] No worker processor registered yet to consume job", jobId);
      return;
    }

    job.state = "active";
    try {
      const result = await memoryProcessor(job);
      job.state = "completed";
      job.returnvalue = result;
      queueEvents.emit("completed", { jobId, returnvalue: result });
    } catch (err) {
      job.state = "failed";
      job.failedReason = err.message || "Unknown worker execution error";
      queueEvents.emit("failed", { jobId, failedReason: job.failedReason });
    }
  });

  return job;
};

/**
 * Query current job status and progress
 */
export const getJobById = async (jobId) => {
  const job = inMemoryJobs.get(jobId);
  if (!job) return null;

  return {
    id: job.id,
    name: job.name,
    state: job.state,
    progress: job.progress || { percent: 0, stage: "QUEUED", message: "In queue" },
    data: {
      sourceLanguage: job.data.sourceLanguage,
      targetLanguage: job.data.targetLanguage,
      submittedAt: job.data.submittedAt,
    },
    returnvalue: job.returnvalue || null,
    failedReason: job.failedReason || null,
  };
};
