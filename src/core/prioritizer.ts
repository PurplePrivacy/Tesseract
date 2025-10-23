import type { Appreciation, GradeResult } from "../output/formatter.ts";

export type PriorityLevel = "LOW" | "MEDIUM" | "HIGH";

type LabelEntry = GradeResult & { label: Appreciation };

export function computePrioritiesForFile(file: {
  score: number;
  fanIn: number;
  labels: {
    avgCyclomatic: LabelEntry;
    avgNesting: LabelEntry;
    fanOutLocal: LabelEntry;
    tokenDensity: LabelEntry;
    commentRatio: LabelEntry;
  };
}) {
  const { fanIn = 0, score = 0 } = file;

  // Risk multipliers
  const changeRisk = 1 + Math.min(0.5, fanIn / 10);   // up to +50% if many depend on it
  const hotspot = 1 + 0.5 * (score / 100);            // up to +50% for high overall load

  // Impact weights (tunable)
  const weights = {
    avgCyclomatic: 0.35,
    avgNesting: 0.25,
    fanOutLocal: 0.2,
    tokenDensity: 0.15,
    commentRatio: 0.05,
  };

  const candidates = [
    { metric: "avgCyclomatic", entry: file.labels.avgCyclomatic },
    { metric: "avgNesting",    entry: file.labels.avgNesting },
    { metric: "fanOutLocal",   entry: file.labels.fanOutLocal },
    { metric: "tokenDensity",  entry: file.labels.tokenDensity },
    { metric: "commentRatio",  entry: file.labels.commentRatio },
  ] as const;

  const prioritized = candidates
    .map(({ metric, entry }) => ({
      metric,
      label: entry.label,
      priorityScore: Number((entry.severity * (weights as any)[metric] * changeRisk * hotspot).toFixed(3)),
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const filePriority = prioritized[0]?.priorityScore ?? 0;
  const level: PriorityLevel = filePriority >= 0.35 ? "HIGH" : filePriority >= 0.2 ? "MEDIUM" : "LOW";

  return { level, filePriority, prioritizedMetrics: prioritized };
}