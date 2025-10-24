import { Command } from "commander";
import path from "path";
import fs from "fs";
import { analyzeProject } from "./core/analyzer";
import { reportResults } from "./output/reporter";
import { writeJsonReport } from "./output/jsonWriter";

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
  .option("--json <path>", "Write JSON report to this file (overrides --out)")
  .option("--no-json", "Do not write JSON report")
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
    const jsonPath = opts.json ? path.resolve(opts.json) : path.join(outDir, defaultJson);

    // Ensure folder
    fs.mkdirSync(outDir, { recursive: true });

    // JSON
    if (opts.json !== false) {
      writeJsonReport(basePath, results, jsonPath);
      console.log(`\n💾 JSON report: ${path.relative(process.cwd(), jsonPath)}`);
    }
  });

program.parse(process.argv);