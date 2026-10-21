import API from "./api.js";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const translateCode = async (code, sourceLanguage, targetLanguage) => {
  const response = await API.post("/code/translate", {
    code,
    sourceLanguage,
    targetLanguage,
  });
  return response.data.data.result;
};

/**
 * Initiates an asynchronous translation and sandbox verification job.
 * Returns 202 with jobId and streaming endpoints.
 */
export const translateAndVerifyAsync = async (code, sourceLanguage, targetLanguage) => {
  const response = await API.post("/code/translate-verify", {
    code,
    sourceLanguage,
    targetLanguage,
  });
  return response.data.data;
};

/**
 * Opens a real-time Server-Sent Events (SSE) stream for tracking the job pipeline.
 */
export const connectToJobStream = (jobId, { onProgress, onCompleted, onFailed, onError }) => {
  const token = localStorage.getItem("token");
  const url = `${BASE_URL}/code/jobs/${jobId}/events?token=${token || ""}`;
  const eventSource = new EventSource(url);

  eventSource.addEventListener("progress", (event) => {
    try {
      const data = JSON.parse(event.data);
      onProgress?.(data);
    } catch (e) {
      console.error("Failed to parse progress event:", e);
    }
  });

  eventSource.addEventListener("completed", (event) => {
    try {
      const data = JSON.parse(event.data);
      onCompleted?.(data.returnvalue);
    } catch (e) {
      console.error("Failed to parse completion event:", e);
    } finally {
      eventSource.close();
    }
  });

  eventSource.addEventListener("failed", (event) => {
    try {
      const data = JSON.parse(event.data);
      onFailed?.(data.failedReason);
    } catch (e) {
      console.error("Failed to parse failure event:", e);
    } finally {
      eventSource.close();
    }
  });

  eventSource.onerror = (err) => {
    console.warn("SSE connection closed or encountered error:", err);
    onError?.(err);
    eventSource.close();
  };

  return () => {
    eventSource.close();
  };
};

export const analyzeComplexity = async (code, language) => {
  const response = await API.post("/code/complexity", { code, language });
  return response.data.data.result;
};

export const optimizeCode = async (code, language) => {
  const response = await API.post("/code/optimize", { code, language });
  return response.data.data.result;
};

export const explainCode = async (code, language) => {
  const response = await API.post("/code/explain", { code, language });
  return response.data.data.result;
};
