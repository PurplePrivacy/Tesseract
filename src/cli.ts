#!/usr/bin/env node
import { Command } from "commander";
import path from "path";
import fs from "fs";
import { analyzeProject } from "./core/analyzer";
import { reportResults } from "./output/reporter";
import { writeJsonReport } from "./output/jsonWriter";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

// Shim __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function makeTimestamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
}

const program = new Command();

program
  .name("tesseract-analysis")
  .argument("<path>", "Path to project folder")
  .option("--out <dir>", "Output directory for reports", "reports")
  .action(async (base, opts) => {
    const basePath = path.resolve(base);
    console.log(`🧠 Analyzing codebase at: ${path.relative(process.cwd(), basePath)}\n`);

    // Run analysis
    const results = await analyzeProject(basePath);
    reportResults(results);

    // Write JSON report
    const outDir = path.resolve(opts.out || "reports");
    fs.mkdirSync(outDir, { recursive: true });
    const timestamp = makeTimestamp();
    const jsonPath = path.join(outDir, `cognitive-report-${timestamp}.json`);
    writeJsonReport(basePath, results, jsonPath);

    // ✅ Correctly resolve visualizer (relative to dist/cli.js)
    const visualizerDir = path.resolve(__dirname, "../../visualizer");
    const nextBuildDir = path.join(visualizerDir, ".next");
    const nodeModulesDir = path.join(visualizerDir, "node_modules");

    // Helper to run npm safely
    function runNpm(args: string[]): Promise<number> {
      return new Promise((resolve) => {
        const npmJs = process.env.npm_execpath;
        if (npmJs && fs.existsSync(npmJs)) {
          const child = spawn(process.execPath, [npmJs, ...args], {
            cwd: visualizerDir,
            stdio: "inherit",
            env: process.env,
          });
          child.on("exit", (code) => resolve(code ?? 1));
        } else {
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

    // Build & start visualizer
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
      } catch (err) {
        console.error("❌ Failed to launch visualizer:", err);
      }
    })();
  });

program.parse(process.argv);