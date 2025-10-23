import fs from "fs";
import path from "path";
import { BANDS, classifyRisk, grade } from "./formatter.ts";
import { computePrioritiesForFile } from "../core/prioritizer.ts";

export function writeJsonReport(
  basePath: string,
  results: any[],
  outFile: string
) {
  const byScore = [...results].sort((a, b) => b.score - a.score);
  const totalFiles = results.length;
  const avgScore =
    totalFiles === 0 ? 0 : results.reduce((s, r) => s + (r.score || 0), 0) / totalFiles;
  const maxFanOut = results.reduce((m, r) => Math.max(m, r.fanOut || 0), 0);

  // Augment each file result with labels and priorities
  const filesAugmented = results.map((r) => {
    const labels = {
      avgCyclomatic: grade(r.avgCyclomatic ?? 0, BANDS.avgCyclomatic, false),
      avgNesting:    grade(r.avgNesting ?? 0,    BANDS.avgNesting,    false),
      fanOutLocal:   grade(r.fanOutLocal ?? 0,   BANDS.fanOutLocal,   false),
      tokenDensity:  grade(r.tokenDensity ?? 0,  BANDS.tokenDensity,  false),
      commentRatio:  grade(r.commentRatio ?? 0,  BANDS.commentRatio,  true),
    };

    const priority = computePrioritiesForFile({
      score: r.score ?? 0,
      fanIn: r.fanIn ?? 0,
      labels,
    });

    return {
      file: r.file.replace(process.cwd(), "."),
      metrics: {
        loc: r.loc,
        functionCount: r.functionCount,
        cyclomatic: r.cyclomatic,
        avgCyclomatic: Number((r.avgCyclomatic ?? 0).toFixed(2)),
        nesting: r.nesting,
        avgNesting: Number((r.avgNesting ?? 0).toFixed(2)),
        fanIn: r.fanIn ?? 0,
        fanOut: r.fanOut ?? 0,
        fanOutLocal: r.fanOutLocal ?? 0,
        tokenDensity: Number((r.tokenDensity ?? 0).toFixed(2)),
        commentRatio: Number((r.commentRatio ?? 0).toFixed(1)),
        score: r.score,
        risk: classifyRisk(r.score ?? 0),
      },
      labels,     // EXCELLENT..POOR + severity per metric
      priority,   // level + prioritizedMetrics
    };
  });

  // Summaries
  function countByLabel(metricKey: keyof typeof BANDS) {
    const acc: Record<string, number> = { POOR: 0, SUBPAR: 0, AVERAGE: 0, GOOD: 0, EXCELLENT: 0 };
    for (const f of filesAugmented) {
      const label = (f.labels as any)[metricKey].label;
      acc[label] = (acc[label] || 0) + 1;
    }
    return acc;
  }

  const summary = {
    totalFiles,
    avgScore: Number(avgScore.toFixed(1)),
    maxFanOut,
    hotspots: byScore.slice(0, 10).map((r) => ({
      file: r.file.replace(process.cwd(), "."),
      score: r.score,
    })),
    countsByLabel: {
      avgCyclomatic: countByLabel("avgCyclomatic"),
      avgNesting: countByLabel("avgNesting"),
      fanOutLocal: countByLabel("fanOutLocal"),
      tokenDensity: countByLabel("tokenDensity"),
      commentRatio: countByLabel("commentRatio"),
    },
    priorityTop: filesAugmented
      .map((f) => ({
        file: f.file,
        level: f.priority.level,
        filePriority: f.priority.filePriority,
        topMetric: f.priority.prioritizedMetrics[0],
      }))
      .sort((a, b) => b.filePriority - a.filePriority)
      .slice(0, 10),
  };

  const generatedAt = new Date().toISOString();

  const json = {
    meta: {
      generatedAt,                  // ISO timestamp for machines
      reportFilename: path.basename(outFile), // filename with timestamp for UI
      basePath,
      version: "0.0.1",
    },
    summary,
    files: filesAugmented,
  };

  const dir = path.dirname(outFile);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(json, null, 2), "utf8");
}