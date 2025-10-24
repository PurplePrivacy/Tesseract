// src/core/analyzer.ts
import fs from "fs";
import path from "path";
import { parseFile } from "./parser";
import { computeMetrics } from "./metrics";
import { computeScore } from "./scorer";

const DEFAULT_IGNORED_DIRS = [
  "node_modules",
  "dist",
  "build",
  ".next",
  ".nuxt",
  ".turbo",
  ".vercel",
  "coverage",
  "out",
  "public"
];

export async function analyzeProject(basePath: string) {
  const files: string[] = [];

  // Recursively collect .ts and .js files AS ABSOLUTE PATHS
  function collectFiles(dir: string) {
    for (const f of fs.readdirSync(dir)) {
      if (DEFAULT_IGNORED_DIRS.includes(f)) continue;
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) {
        collectFiles(p);
      } else if (p.endsWith(".ts") || p.endsWith(".tsx") || p.endsWith(".js")) {
        files.push(path.resolve(p)); // <-- absolute
      }
    }
  }

  collectFiles(basePath);

  // Phase 1: parse all files and collect imports
  const parsedResults = files.map((file) => ({
    file, // absolute path
    parsed: parseFile(file),
  }));

  // Phase 2: build reverse dependency map (for fanIn)
  const reverseDeps: Record<string, number> = {};

  // Resolve relative imports to actual files
  function resolveImport(baseDir: string, dep: string): string | null {
    if (!dep.startsWith(".")) return null; // skip node_modules etc.
    const candidates = [
      path.resolve(baseDir, dep),
      path.resolve(baseDir, dep + ""),
      path.resolve(baseDir, dep + ".js"),
      path.resolve(baseDir, dep, "index"),
      path.resolve(baseDir, dep, "index.js"),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return path.normalize(c); // canonicalize
    }
    return null;
  }

  for (const { file, parsed } of parsedResults) {
    const fileDir = path.dirname(file);
    for (const dep of parsed.imports) {
      const resolved = resolveImport(fileDir, dep);
      if (resolved) {
        const key = path.normalize(resolved); // absolute + normalized
        reverseDeps[key] = (reverseDeps[key] || 0) + 1;
      }
    }
  }

  // Phase 3: compute metrics and scores
  const results = [];
  for (const { file, parsed } of parsedResults) {
    const metrics = computeMetrics(parsed);
    const key = path.normalize(file); // absolute + normalized
    const fanIn = reverseDeps[key] || 0;
    const score = computeScore(metrics);
    results.push({ file, ...metrics, fanIn, score });
  }

  return results;
}