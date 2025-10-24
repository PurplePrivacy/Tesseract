"use client";
import React from "react";
import type { TesseractJson } from "@/lib/types";

export default function SummaryInsight({ data }: { data: TesseractJson }) {
  const s = data.summary;
  const total = Math.max(1, s.totalFiles || 1);
  // countsByLabel is metric → { EXCELLENT, GOOD, AVERAGE, SUBPAR, POOR }
  const cb: any = (s as any).countsByLabel || {};

  // Helper: count problematic files for a given metric
  const heavyCount = (metric: string) => (cb[metric]?.POOR ?? 0) + (cb[metric]?.SUBPAR ?? 0);
  const dominates = (metric: string, frac = 0.15) => heavyCount(metric) / total >= frac; // 15%+ of files

  const avg = s.avgScore;
  let base: string;
  if (avg < 25) base = "Excellent overall clarity with low cognitive load.";
  else if (avg < 40) base = "Solid readability; most modules are easy to follow.";
  else if (avg < 60) base = "Generally understandable, with a few complexity hotspots.";
  else if (avg < 80) base = "Elevated complexity; several areas deserve refactoring.";
  else base = "Severe complexity; a focused refactor plan is recommended.";

  const notes: string[] = [];
  if (dominates("fanOutLocal")) notes.push("coupling between modules is a primary driver");
  if (dominates("avgFunctionLength") || dominates("maxFunctionLength")) notes.push("long functions reduce scanability");
  if (dominates("avgParamCount") || dominates("maxParamCount")) notes.push("bulky parameter lists hint at data clumps");
  if (dominates("avgCyclomatic")) notes.push("branching complexity increases reasoning effort");
  if (dominates("avgNesting")) notes.push("deep nesting affects linear reading flow");
  if (dominates("methodCount") || dominates("maxMethodsPerClass")) notes.push("large classes suggest SRP pressure");
  if (dominates("foreignAccessCount")) notes.push("frequent foreign member access signals feature envy");
  if (dominates("totalReturnCount")) notes.push("many return paths complicate control flow");
  if (dominates("exportCount")) notes.push("wide public APIs reduce cohesion");

  let insight = base;
  if (notes.length) {
    const topNotes = notes.slice(0, 2).join("; ");
    insight += ` ${topNotes}.`;
  }

  // Nudge toward the top actionable item when available
  const top = s.priorityTop?.[0];
  if (top?.file && top?.topMetric?.metric && top?.topMetric?.label) {
    insight += ` Focus first on ${top.file} (${top.topMetric.metric}: ${top.topMetric.label}).`;
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-ink-300 italic mt-4">
      {insight}
    </div>
  );
}