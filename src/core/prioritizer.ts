import type { Appreciation, GradeResult } from "../output/formatter";

export type PriorityLevel = "LOW" | "MEDIUM" | "HIGH";

type LabelEntry = GradeResult & { label: Appreciation };


const INSIGHT_MESSAGES: Record<string, Record<string, string>> = {
  avgCyclomatic: {
    EXCELLENT: "Functions are concise and straightforward.",
    GOOD: "Minor branching present, but manageable.",
    AVERAGE: "Cyclomatic complexity may increase test effort.",
    SUBPAR: "High branching leads to mental overload.",
    POOR: "High cyclomatic complexity causes cognitive load and hidden bugs.",
  },
  avgNesting: {
    EXCELLENT: "Code is flat and easy to follow.",
    GOOD: "Slight indentation depth, still readable.",
    AVERAGE: "Some nested structures increase visual fatigue.",
    SUBPAR: "Deep nesting reduces code readability.",
    POOR: "Excessive nesting makes reasoning difficult.",
  },
  fanOutLocal: {
    EXCELLENT: "Low coupling — modules are well-isolated.",
    GOOD: "Moderate coupling — acceptable dependency level.",
    AVERAGE: "High dependency count may affect modularity.",
    SUBPAR: "Modules rely heavily on external logic.",
    POOR: "Severe coupling — refactor to decouple responsibilities.",
  },
  tokenDensity: {
    EXCELLENT: "Code is visually clean and breathable.",
    GOOD: "Compact yet readable code structure.",
    AVERAGE: "Lines feel dense — slight readability loss.",
    SUBPAR: "High density may hide complexity.",
    POOR: "Overly dense code causes cognitive strain.",
  },
  commentRatio: {
    EXCELLENT: "Well-documented code — easy onboarding.",
    GOOD: "Sufficient documentation coverage.",
    AVERAGE: "Documentation could improve readability.",
    SUBPAR: "Sparse comments hinder understanding.",
    POOR: "Lack of documentation increases maintenance cost.",
  },
};

export function computePrioritiesForFile(file: {
  score: number;
  fanIn: number;
  avgCyclomatic: number;
  avgNesting: number;
  fanOutLocal: number;
  tokenDensity: number;
  commentRatio: number;
  labels: Record<string, GradeResult>;
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
  .map(({ metric, entry }) => {
    return {
      metric,
      label: entry?.label,
      priorityScore: Number(
        (entry!.severity * (weights as any)[metric] * changeRisk * hotspot).toFixed(3)
      ),
      insight:
        INSIGHT_MESSAGES[metric]?.[entry!.label] ??
        INSIGHT_MESSAGES.DEFAULT?.[entry!.label] ??
        "",
    };
  })
  .sort((a, b) => b.priorityScore - a.priorityScore);

  const filePriority = prioritized[0]?.priorityScore ?? 0;
  const level: PriorityLevel = filePriority >= 0.35 ? "HIGH" : filePriority >= 0.2 ? "MEDIUM" : "LOW";

  return { level, filePriority, prioritizedMetrics: prioritized };
}