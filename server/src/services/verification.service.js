import { groq, GROQ_MODEL } from "../config/groq.config.js";
import { runInSandbox } from "./sandbox.service.js";

const MAX_HEALING_ITERATIONS = 3;

const stripCodeFences = (text) => {
  if (!text) return "";
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  // Strip markdown code fences if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-zA-Z0-9_-]*\n/, "").replace(/```$/, "").trim();
  }
  return cleaned;
};

/**
 * Generates an automated, self-contained test harness in the target language.
 * The harness defines test cases and executes them, printing clear PASS/FAIL markers.
 */
export const generateTestHarness = async (sourceCode, sourceLang, targetLang, targetCode) => {
  const prompt = `You are a test automation engineer.
Source Language: ${sourceLang}
Target Language: ${targetLang}

Target Code to verify:
${targetCode}

Original Source Code (for behavioral reference):
${sourceCode}

Task:
Write a self-contained executable test harness in ${targetLang} that runs 3 to 4 unit assertions against the Target Code.
Rules:
1. Include the translated target code AND the test assertions in a single executable file.
2. The file MUST have an entry point (e.g. main() function, or top-level execution).
3. Print "[TEST_PASS]: Case <N>" for each successful assertion.
4. If an assertion fails, print "[TEST_FAIL]: <Reason>" and exit with code 1.
5. Do NOT include any markdown code fences, triple backticks, or explanatory conversation. Return ONLY the raw runnable code.`;

  const response = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: "You are an automated test harness generator. Output ONLY raw runnable code with no markdown formatting." },
      { role: "user", content: prompt },
    ],
    temperature: 0.1,
  });

  return stripCodeFences(response.choices[0]?.message?.content || "");
};

/**
 * Feeds compiler errors or test failures back to the LLM to automatically fix the translation.
 */
export const healTranslation = async ({ originalCode, sourceLang, targetLang, currentCode, stderr, iteration }) => {
  const prompt = `You are an expert polyglot programmer fixing a translation error.
Source Language: ${sourceLang}
Target Language: ${targetLang}

Original Source Code:
${originalCode}

Current Translated Code that failed:
${currentCode}

Compiler / Runtime Error Output (Iteration ${iteration}):
---
${stderr}
---

Task:
Analyze the error output and produce a corrected version of the code in ${targetLang}.
Rules:
1. Fix the syntax, type, import, or logical error indicated by the compiler/test runner.
2. Keep the same function names and signatures so test cases can call it.
3. Return ONLY the raw corrected ${targetLang} code. Do NOT wrap in markdown formatting or triple backticks. Do not add explanations.`;

  const response = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: "You are an automated code repair agent. Output ONLY raw corrected code with zero markdown wrapping." },
      { role: "user", content: prompt },
    ],
    temperature: 0.1,
  });

  return stripCodeFences(response.choices[0]?.message?.content || "");
};

/**
 * Orchestrates the closed-loop verification and self-healing pipeline.
 */
export const verifyAndSelfHeal = async ({
  originalCode,
  sourceLanguage,
  targetLanguage,
  initialTranslation,
  onProgress = () => {},
}) => {
  let currentCode = initialTranslation;
  let iteration = 0;
  const history = [];

  while (iteration <= MAX_HEALING_ITERATIONS) {
    onProgress({
      stage: iteration === 0 ? "GENERATING_TESTS" : `HEALING_ITERATION_${iteration}`,
      percent: 30 + iteration * 15,
      message: iteration === 0 
        ? "Generating executable test harness..." 
        : `Applying self-healing repair (Iteration ${iteration} of ${MAX_HEALING_ITERATIONS})...`,
    });

    // 1. Generate executable test harness combining code + assertions
    const testHarness = await generateTestHarness(originalCode, sourceLanguage, targetLanguage, currentCode);

    onProgress({
      stage: "SANDBOX_COMPILING",
      percent: 45 + iteration * 15,
      message: `Compiling and executing in isolated sandbox...`,
    });

    // 2. Execute in Sandbox
    const executionResult = await runInSandbox(testHarness, targetLanguage);

    history.push({
      iteration,
      stage: executionResult.stage,
      exitCode: executionResult.exitCode,
      stdout: executionResult.stdout,
      stderr: executionResult.stderr,
      durationMs: executionResult.durationMs,
    });

    // 3. Check for success
    if (executionResult.exitCode === 0) {
      return {
        verified: true,
        finalCode: currentCode,
        iterations: iteration,
        testOutput: executionResult.stdout,
        history,
      };
    }

    // If failed and iterations remaining, trigger self-healing repair
    iteration++;
    if (iteration <= MAX_HEALING_ITERATIONS) {
      onProgress({
        stage: "SELF_HEALING",
        percent: 50 + iteration * 10,
        message: `Compiler/test failure detected (Exit code ${executionResult.exitCode}). Feeding stderr into repair prompt...`,
      });

      currentCode = await healTranslation({
        originalCode,
        sourceLang: sourceLanguage,
        targetLang: targetLanguage,
        currentCode,
        stderr: executionResult.stderr || executionResult.stdout,
        iteration,
      });
    }
  }

  // If iterations exhausted without passing
  return {
    verified: false,
    finalCode: currentCode,
    iterations: MAX_HEALING_ITERATIONS,
    testOutput: history[history.length - 1]?.stderr || "Verification failed after maximum repair attempts.",
    history,
  };
};
