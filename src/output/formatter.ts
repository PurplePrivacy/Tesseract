export type Risk = "LOW" | "MEDIUM" | "HIGH";
export type Appreciation = "EXCELLENT" | "GOOD" | "AVERAGE" | "SUBPAR" | "POOR";

export interface GradeResult {
  label: Appreciation;
  severity: number; // 0 (excellent) → 1 (poor)
}

// Color palette for reports (JSON consumers / PDF can map these)
export const COLORS: Record<Risk, string> = {
  LOW: "#27ae60",     // green
  MEDIUM: "#f1c40f",  // yellow
  HIGH: "#e74c3c",    // red
};

// Opinionated initial thresholds (can be externalized to config later)
// lower-is-better unless noted
export const BANDS = {
  avgCyclomatic: { excellent: 4, good: 7, average: 10, subpar: 15 }, // >15 = POOR
  avgNesting:    { excellent: 1, good: 2, average: 3,  subpar: 4  }, // >=5 = POOR
  fanOutLocal:   { excellent: 3, good: 7, average: 12, subpar: 20 }, // >20 = POOR
  tokenDensity:  { excellent: 5, good: 8, average: 12, subpar: 16 }, // >16 = POOR
  // higher-is-better:
  commentRatio:  { excellent: 15, good: 10, average: 5, subpar: 2  }, // <2% = POOR
};

export function classifyRisk(score: number): Risk {
  if (score < 30) return "LOW";
  if (score < 60) return "MEDIUM";
  return "HIGH";
}

export function grade(
  value: number,
  bands: { excellent: number; good: number; average: number; subpar: number },
  higherIsBetter = false
): GradeResult {
  const v = Number.isFinite(value) ? value : 0;

  if (!higherIsBetter) {
    if (v <= bands.excellent) return { label: "EXCELLENT", severity: 0.0 };
    if (v <= bands.good)      return { label: "GOOD",      severity: 0.25 };
    if (v <= bands.average)   return { label: "AVERAGE",   severity: 0.5 };
    if (v <= bands.subpar)    return { label: "SUBPAR",    severity: 0.75 };
    return { label: "POOR", severity: 1.0 };
  }

  // higher-is-better (e.g., comment ratio)
  if (v >= bands.excellent) return { label: "EXCELLENT", severity: 0.0 };
  if (v >= bands.good)      return { label: "GOOD",      severity: 0.25 };
  if (v >= bands.average)   return { label: "AVERAGE",   severity: 0.5 };
  if (v >= bands.subpar)    return { label: "SUBPAR",    severity: 0.75 };
  return { label: "POOR", severity: 1.0 };
}