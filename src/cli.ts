#!/usr/bin/env node
import { Command } from "commander";
import path from "path";
import fs from "fs";
import { analyzeProject } from "./core/analyzer";
import { reportResults } from "./output/reporter";
import { writeJsonReport } from "./output/jsonWriter";
import { exec } from "child_process";
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

    // ✅ Resolve packaged visualizer (relative to dist/cli.js) and run from a working dir
    const pkgVisualizerDir = path.resolve(__dirname, "../../visualizer");
    const workDir = path.resolve(process.cwd(), ".tesseract-visualizer");
    const workNodeModules = path.join(workDir, "node_modules");
    const workNextBuild = path.join(workDir, ".next");

    // Fresh copy into working dir (Next.js has trouble building from node_modules)
    try { fs.rmSync(workDir, { recursive: true, force: true }); } catch {}
    fs.cpSync(pkgVisualizerDir, workDir, { recursive: true });

    // Link (or copy) the reports directory so the UI can read latest JSONs
    try {
      const reportsTarget = path.resolve(outDir);
      const reportsLink = path.join(workDir, "reports");
      try { fs.rmSync(reportsLink, { recursive: true, force: true }); } catch {}
      try { fs.symlinkSync(reportsTarget, reportsLink, "dir"); }
      catch { fs.cpSync(reportsTarget, reportsLink, { recursive: true }); }
    } catch (e) {
      console.warn("⚠️ Unable to link/copy reports folder:", e);
    }

    // Helper: run commands via shell so npm is resolved from PATH (avoids NVM ENOENT)
    function execIn(cmd: string, cwd: string): Promise<void> {
      return new Promise((resolve, reject) => {
        const child = exec(cmd, { cwd, env: process.env }, (err) => {
          if (err) reject(err); else resolve();
        });
        child.stdout?.pipe(process.stdout);
        child.stderr?.pipe(process.stderr);
      });
    }

    (async () => {
      try {
        if (!fs.existsSync(workNodeModules)) {
          console.log("📦 Installing visualizer dependencies...");
          await execIn("npm ci", workDir);
        }
        if (!fs.existsSync(workNextBuild)) {
          console.log("🧩 Building visualizer for the first time...");
          await execIn("npm run build", workDir);
        }
        console.log("🚀 Launching visualizer (production mode) on http://localhost:5555 ...");
        await execIn("npm start", workDir);
      } catch (err) {
        console.error("❌ Failed to launch visualizer:", err);
      }
    })();
  });

program.parse(process.argv);