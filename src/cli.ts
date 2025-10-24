#!/usr/bin/env node
import { Command } from "commander";
import path from "path";
import fs from "fs";
import { analyzeProject } from "./core/analyzer";
import { reportResults } from "./output/reporter";
import { writeJsonReport } from "./output/jsonWriter";
import { spawn } from "child_process";

function makeTimestamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  // file-system friendly: 2025-10-23_14-05-12
  return `${yyyy}-${mm}-${dd}_${hh}-${mi}-${ss}`;
}

const program = new Command();

program
  .name("tesseract-analyze")
  .argument("<path>", "Path to project folder")
  .option("--out <dir>", "Output directory for reports", "reports")
  .action(async (base, opts) => {
    const basePath = path.resolve(base);
    console.log(`🧠 Analyzing codebase at: ${path.relative(process.cwd(), basePath)}\n`);

    const results = await analyzeProject(basePath);

    // Console table
    reportResults(results);

    // Resolve output paths
    const outDir = path.resolve(opts.out || "reports");
    const timestamp = makeTimestamp();
    const defaultJson = `cognitive-report-${timestamp}.json`;
    const jsonPath = path.join(outDir, defaultJson);

    // Ensure folder
    fs.mkdirSync(outDir, { recursive: true });

    // JSON
    writeJsonReport(basePath, results, jsonPath);

    // Launch visualizer server in production mode
    // Resolve the visualizer inside the installed package:
    // dist/ (this file) -> ../visualizer
    const visualizerDir = path.resolve(__dirname, "../visualizer");
    const nextBuildDir = path.join(visualizerDir, ".next");
    const nodeModulesDir = path.join(visualizerDir, "node_modules");

    // Helper to run npm reliably even when npm is not on PATH.
    // Prefer npm_execpath (the npm CLI JS), executed with the current Node.
    function runNpm(args: string[]): Promise<number> {
      return new Promise((resolve) => {
        const npmJs = process.env.npm_execpath; // e.g., .../lib/node_modules/npm/bin/npm-cli.js
        if (npmJs && fs.existsSync(npmJs)) {
          const child = spawn(process.execPath, [npmJs, ...args], {
            cwd: visualizerDir,
            stdio: "inherit",
            env: process.env,
          });
          child.on("exit", (code) => resolve(code ?? 1));
        } else {
          // Fallback to npm binary name (platform-specific)
          const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
          const child = spawn(npmCmd, args, {
            cwd: visualizerDir,
            stdio: "inherit",
            env: process.env,
          });
          child.on("exit", (code) => resolve(code ?? 1));
        }
      });
    }

    // Ensure dependencies, then build (if needed), then start.
    (async () => {
      try {
        if (!fs.existsSync(nodeModulesDir)) {
          console.log("📦 Installing visualizer dependencies...");
          const installCode = await runNpm(["ci"]);
          if (installCode !== 0) {
            console.error("❌ Failed to install visualizer dependencies.");
            return;
          }
        }

        if (!fs.existsSync(nextBuildDir)) {
          console.log("🧩 Building visualizer for the first time...");
          const buildCode = await runNpm(["run", "build"]);
          if (buildCode !== 0) {
            console.error("❌ Failed to build visualizer.");
            return;
          }
        }

        console.log("🚀 Launching visualizer (production mode)...");
        await runNpm(["start"]);
      } catch (e) {
        console.error("❌ Failed to launch visualizer:", e);
      }
    })();
  });

program.parse(process.argv);