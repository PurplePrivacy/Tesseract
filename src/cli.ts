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
    const visualizerDir = path.resolve("visualizer");
    const nextBuildDir = path.join(visualizerDir, ".next");

    const npmCmd = /^win/.test(process.platform) ? "npm.cmd" : "npm";
    if (!fs.existsSync(nextBuildDir)) {
      console.log("🧩 Building visualizer for the first time...");
      const buildProcess = spawn(npmCmd, ["run", "build"], {
        cwd: visualizerDir,
        stdio: "inherit",
        env: process.env
      });

      buildProcess.on("exit", (code) => {
        if (code === 0) {
          console.log("🚀 Launching visualizer (production mode)...");
          spawn(npmCmd, ["start"], {
            cwd: visualizerDir,
            stdio: "inherit",
            env: process.env
          });
        } else {
          console.error("❌ Failed to build visualizer.");
        }
      });
    } else {
      console.log("🚀 Launching visualizer (production mode)...");
      spawn(npmCmd, ["start"], {
        cwd: visualizerDir,
        stdio: "inherit",
        env: process.env
      });
    }
  });

program.parse(process.argv);