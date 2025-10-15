import fs from "fs";
import path from "path";
import { parseFile } from "./parser.ts";
import { computeMetrics } from "./metrics.ts";
import { computeScore } from "./scorer.ts";

export async function analyzeProject(basePath: string) {
  const files: string[] = [];

  function collectFiles(dir: string) {
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) collectFiles(p);
      else if (p.endsWith(".ts") || p.endsWith(".js")) files.push(p);
    }
  }

  collectFiles(basePath);

  const results = [];

  for (const file of files) {
    const parsed = parseFile(file);
    const metrics = computeMetrics(parsed);
    const score = computeScore(metrics);
    results.push({ file, ...metrics, score });
  }

  return results;
}