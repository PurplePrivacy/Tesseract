"use client";
import React from "react";
import { TesseractJson } from "@/lib/types";

export default function SummaryInsight({ data }: { data: TesseractJson }) {
  const s = data.summary;

  // Basic heuristics
  const avg = s.avgScore;
  const cyclo = s.countsByLabel.avgCyclomatic;
  const nesting = s.countsByLabel.avgNesting;
  const fanOut = s.countsByLabel.fanOutLocal;

  let insight = "Balanced complexity with moderate readability.";

  if (avg < 15 && cyclo.EXCELLENT > s.totalFiles / 2) {
    insight = "Outstanding readability and structure. Minimal refactoring needed.";
  } else if (avg < 30) {
    insight = "Strong readability and low complexity across modules.";
  } else if (avg < 60) {
    insight = "Generally clear codebase, but some hotspots may need modular refactor.";
  } else if (avg < 80) {
    insight = "High complexity — consider splitting large functions or reducing nesting.";
  } else {
    insight = "Severe architectural complexity detected. Major refactor recommended.";
  }

  // Add nuance if certain patterns dominate
  if (fanOut.POOR > 0 && avg > 30) {
    insight += " Excessive coupling between modules is a primary contributor.";
  } else if (nesting.SUBPAR > 0 && avg > 20) {
    insight += " Deep nesting may affect code scanning speed.";
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-ink-300 italic mt-4">
      {insight}
    </div>
  );
}