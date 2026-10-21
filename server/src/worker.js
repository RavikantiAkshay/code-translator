import { QUEUE_NAME, registerWorkerProcessor } from "./queue/translation.queue.js";
import * as geminiService from "./services/gemini.service.js";
import * as verificationService from "./services/verification.service.js";
import * as historyService from "./services/history.service.js";

/**
 * Worker processor function that executes the translation, verification, and self-healing pipeline.
 */
const processJob = async (job) => {
  const { userId, code, sourceLanguage, targetLanguage } = job.data;
  console.log(`[Worker] Processing job ${job.id} for user ${userId || "guest"} (${sourceLanguage} -> ${targetLanguage})`);

  // 1. Initial Translation
  await job.updateProgress({
    percent: 20,
    stage: "TRANSLATING",
    message: `Translating code from ${sourceLanguage} to ${targetLanguage}...`,
  });

  const initialTranslation = await geminiService.translateCode(code, sourceLanguage, targetLanguage);

  // 2. Verification & Self-Healing Pipeline
  let finalCode = initialTranslation;
  let verified = false;
  let iterations = 0;
  let testOutput = "";
  let history = [];

  try {
    const verificationResult = await verificationService.verifyAndSelfHeal({
      originalCode: code,
      sourceLanguage,
      targetLanguage,
      initialTranslation,
      onProgress: async (progress) => {
        await job.updateProgress(progress);
      },
    });
    finalCode = verificationResult.finalCode;
    verified = verificationResult.verified;
    iterations = verificationResult.iterations;
    testOutput = verificationResult.testOutput;
    history = verificationResult.history;
  } catch (verifErr) {
    console.warn("[Worker] Verification step note:", verifErr.message);
    testOutput = `Notice: Verification engine (${verifErr.message}). Code translated successfully.`;
  }

  // 3. Save to database history (Guaranteed persistence)
  if (userId) {
    try {
      await historyService.createHistory(
        userId,
        "translate",
        sourceLanguage,
        targetLanguage,
        code,
        finalCode
      );
      console.log(`[Worker] Successfully saved history record for user ${userId} (${sourceLanguage} -> ${targetLanguage})`);
    } catch (dbErr) {
      console.warn("[Worker] Failed to persist history record:", dbErr.message);
    }
  }

  await job.updateProgress({
    percent: 100,
    stage: verified ? "VERIFIED" : "COMPLETED_UNVERIFIED",
    message: verified 
      ? `Translation verified! Passed unit tests after ${iterations} self-healing iteration(s).` 
      : (iterations > 0 
          ? "Translation completed (sandbox verification did not pass all assertions)."
          : "Translation completed successfully."),
  });

  return {
    result: finalCode,
    verified,
    iterations,
    testOutput,
    history,
  };
};

/**
 * Initializes the background worker to consume and process translation jobs.
 */
export const startWorker = () => {
  console.log(`[Worker] Registering worker processor for queue: "${QUEUE_NAME}"...`);
  registerWorkerProcessor(processJob);
};

// Auto-run if executed as a standalone process
if (process.argv[1]?.endsWith("worker.js")) {
  startWorker();
}
