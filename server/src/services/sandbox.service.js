import { execFile, spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";
import crypto from "crypto";

// Configured memory and timeout boundaries
const EXECUTION_TIMEOUT_MS = 8000;
const MAX_OUTPUT_BYTES = 64 * 1024; // 64 KB cap to prevent buffer flooding

/**
 * Maps language ID to file extensions and execution commands
 */
const LANGUAGE_RUNNERS = {
  javascript: {
    filename: "solution.mjs",
    run: (filePath, dir) => ({
      cmd: "node",
      args: ["--max-old-space-size=128", filePath],
    }),
  },
  typescript: {
    filename: "solution.ts",
    run: (filePath, dir) => ({
      cmd: process.platform === "win32" ? "npx.cmd" : "npx",
      args: ["--yes", "tsx", filePath],
    }),
  },
  python: {
    filename: "solution.py",
    run: (filePath, dir) => ({
      cmd: process.platform === "win32" ? "python" : "python3",
      args: ["-u", filePath],
    }),
  },
  c: {
    filename: "solution.c",
    isCompiled: true,
    compile: (filePath, dir) => {
      const out = path.join(dir, process.platform === "win32" ? "solution.exe" : "solution.out");
      return {
        cmd: "gcc",
        args: ["-O2", filePath, "-o", out],
        outBinary: out,
      };
    },
  },
  cpp: {
    filename: "solution.cpp",
    isCompiled: true,
    compile: (filePath, dir) => {
      const out = path.join(dir, process.platform === "win32" ? "solution.exe" : "solution.out");
      return {
        cmd: "g++",
        args: ["-O2", filePath, "-o", out],
        outBinary: out,
      };
    },
  },
  java: {
    filename: "Main.java",
    isCompiled: true,
    compile: (filePath, dir) => ({
      cmd: "javac",
      args: [filePath],
      outBinary: "Main",
    }),
    runCompiled: (binaryName, dir) => ({
      cmd: "java",
      args: ["-Xmx128m", binaryName],
    }),
  },
  csharp: {
    filename: "Program.cs",
    run: (filePath, dir) => ({
      cmd: "dotnet",
      args: ["run", "--project", dir],
    }),
  },
};

/**
 * Sanitizes the environment passed to the sandbox child process.
 * Strips all sensitive API keys, database credentials, and server secrets.
 */
const getSanitizedEnv = () => {
  const safeEnv = {
    PATH: process.env.PATH || "",
    TEMP: process.env.TEMP || os.tmpdir(),
    TMP: process.env.TMP || os.tmpdir(),
    NODE_ENV: "sandbox",
  };
  return safeEnv;
};

/**
 * Executes a child process with a hard wall-clock timeout and output cap.
 */
const executeProcess = (cmd, args, cwd, timeoutMs = EXECUTION_TIMEOUT_MS) => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let killed = false;

    const child = spawn(cmd, args, {
      cwd,
      env: getSanitizedEnv(),
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"],
    });

    const timer = setTimeout(() => {
      timedOut = true;
      killed = true;
      try {
        if (process.platform === "win32") {
          execFile("taskkill", ["/F", "/T", "/PID", child.pid.toString()]);
        } else {
          child.kill("SIGKILL");
        }
      } catch (err) {
        // Process might already be dead
      }
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      if (stdout.length < MAX_OUTPUT_BYTES) {
        stdout += chunk.toString("utf8");
      }
    });

    child.stderr.on("data", (chunk) => {
      if (stderr.length < MAX_OUTPUT_BYTES) {
        stderr += chunk.toString("utf8");
      }
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      const durationMs = Date.now() - startTime;
      resolve({
        exitCode: 1,
        stdout,
        stderr: stderr ? `${stderr}\n${err.message}` : err.message,
        durationMs,
        timedOut: false,
      });
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      const durationMs = Date.now() - startTime;
      resolve({
        exitCode: timedOut ? 124 : (code ?? 0),
        stdout: stdout.trim(),
        stderr: timedOut ? `Execution timed out after ${timeoutMs}ms (Process killed)` : stderr.trim(),
        durationMs,
        timedOut,
      });
    });
  });
};

/**
 * Executes untrusted code inside an isolated, ephemeral sandbox directory.
 */
export const runInSandbox = async (code, language) => {
  const runner = LANGUAGE_RUNNERS[language?.toLowerCase()];
  if (!runner) {
    return {
      success: false,
      stage: "UNSUPPORTED_LANGUAGE",
      exitCode: 1,
      stdout: "",
      stderr: `Language "${language}" is not currently configured in the execution sandbox runner.`,
      durationMs: 0,
    };
  }

  // Create isolated ephemeral directory
  const sandboxDir = path.join(os.tmpdir(), "codetranslator-sandbox", crypto.randomUUID());
  await fs.mkdir(sandboxDir, { recursive: true });

  const targetFilePath = path.join(sandboxDir, runner.filename);
  await fs.writeFile(targetFilePath, code, "utf8");

  try {
    // 1. Compilation Stage (for compiled languages like C, C++, Java)
    if (runner.isCompiled && runner.compile) {
      const compileConfig = runner.compile(targetFilePath, sandboxDir);
      const compileRes = await executeProcess(compileConfig.cmd, compileConfig.args, sandboxDir, 10000);

      if (compileRes.exitCode !== 0) {
        return {
          success: false,
          stage: "COMPILATION",
          exitCode: compileRes.exitCode,
          stdout: compileRes.stdout,
          stderr: compileRes.stderr,
          durationMs: compileRes.durationMs,
        };
      }

      // If compiled binary has special run invocation (e.g. Java)
      if (runner.runCompiled) {
        const runConfig = runner.runCompiled(compileConfig.outBinary, sandboxDir);
        const runRes = await executeProcess(runConfig.cmd, runConfig.args, sandboxDir, EXECUTION_TIMEOUT_MS);
        return {
          success: runRes.exitCode === 0,
          stage: "RUNTIME",
          exitCode: runRes.exitCode,
          stdout: runRes.stdout,
          stderr: runRes.stderr,
          durationMs: compileRes.durationMs + runRes.durationMs,
        };
      } else {
        // Direct execution of compiled binary (.exe or .out)
        const binaryPath = compileConfig.outBinary;
        const runRes = await executeProcess(binaryPath, [], sandboxDir, EXECUTION_TIMEOUT_MS);
        return {
          success: runRes.exitCode === 0,
          stage: "RUNTIME",
          exitCode: runRes.exitCode,
          stdout: runRes.stdout,
          stderr: runRes.stderr,
          durationMs: compileRes.durationMs + runRes.durationMs,
        };
      }
    }

    // 2. Direct Runtime Execution (Python, JS, TS, etc.)
    const runConfig = runner.run(targetFilePath, sandboxDir);
    const runRes = await executeProcess(runConfig.cmd, runConfig.args, sandboxDir, EXECUTION_TIMEOUT_MS);

    return {
      success: runRes.exitCode === 0,
      stage: "RUNTIME",
      exitCode: runRes.exitCode,
      stdout: runRes.stdout,
      stderr: runRes.stderr,
      durationMs: runRes.durationMs,
    };
  } finally {
    // Guaranteed ephemeral directory cleanup
    try {
      await fs.rm(sandboxDir, { recursive: true, force: true });
    } catch (cleanupErr) {
      // Non-blocking cleanup warning
      console.warn("Failed to clean up sandbox directory:", sandboxDir, cleanupErr.message);
    }
  }
};
