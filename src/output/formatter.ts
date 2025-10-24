export type Risk = "LOW" | "MEDIUM" | "HIGH";
export type Appreciation = "EXCELLENT" | "GOOD" | "AVERAGE" | "SUBPAR" | "POOR";

export interface GradeResult {
  label: Appreciation;
  severity: number; // 0 (excellent) → 1 (poor)
  insight?: string;
}

export const COLORS: Record<Risk, string> = {
  LOW: "#27ae60",     // green
  MEDIUM: "#f1c40f",  // yellow
  HIGH: "#e74c3c",    // red
};

/**
 * Thresholds for grading. Unless otherwise noted, LOWER is better.
 * Values are inclusive for each band; greater-than the last band ⇒ POOR.
 */
export const BANDS: Record<string, { excellent: number; good: number; average: number; subpar: number }> = {
  // Existing
  avgCyclomatic: { excellent: 4,  good: 7,  average: 10, subpar: 15 },   // >15 = POOR
  avgNesting:    { excellent: 1,  good: 2,  average: 3,  subpar: 4  },   // >=5 = POOR
  fanOutLocal:   { excellent: 3,  good: 7,  average: 12, subpar: 20 },   // >20 = POOR
  tokenDensity:  { excellent: 5,  good: 8,  average: 12, subpar: 16 },   // >16 = POOR
  // Optional metric (often disabled by default in config); for comment ratio HIGHER is better
  commentRatio:  { excellent: 15, good: 10, average: 5,  subpar: 2  },    // <2% = POOR (pass higherIsBetter=true when grading)

  // New structural metrics (LOWER is better unless stated)
  // Function length (in lines)
  avgFunctionLength: { excellent: 10, good: 20, average: 30, subpar: 50 }, // >50 = POOR
  maxFunctionLength: { excellent: 20, good: 40, average: 80, subpar: 120 }, // >120 = POOR

  // Parameter counts (per function)
  avgParamCount:     { excellent: 2,  good: 3,  average: 4,  subpar: 5  }, // >5 = POOR
  maxParamCount:     { excellent: 3,  good: 5,  average: 7,  subpar: 9  }, // >9 = POOR

  // Returns (total return statements across the file)
  totalReturnCount:  { excellent: 5,  good: 10, average: 20, subpar: 40 }, // >40 = POOR

  // Exports (number of exported symbols per file)
  exportCount:       { excellent: 3,  good: 6,  average: 10, subpar: 15 }, // >15 = POOR

  // Foreign member access count (feature envy signal)
  foreignAccessCount:{ excellent: 5,  good: 10, average: 20, subpar: 35 }, // >35 = POOR

  // Methods and classes
  methodCount:       { excellent: 10, good: 15, average: 25, subpar: 35 }, // >35 = POOR (total methods in file)
  maxMethodsPerClass:{ excellent: 10, good: 15, average: 25, subpar: 35 }, // >35 = POOR (per single class)
  classCount:        { excellent: 1,  good: 2,  average: 3,  subpar: 5  }, // >5 = POOR (too many classes in one file)
};

export function classifyRisk(score: number): Risk {
  if (score < 30) return "LOW";
  if (score < 60) return "MEDIUM";
  return "HIGH";
}

export function grade(
  value: number,
  bands: { excellent: number; good: number; average: number; subpar: number } | undefined,
  higherIsBetter = false,
  metric: string = "DEFAULT"
): GradeResult {
  const v = Number.isFinite(value) ? value : 0;
  let label: Appreciation;

  if (!higherIsBetter) {
    if (v <= bands!.excellent) label = "EXCELLENT";
    else if (v <= bands!.good) label = "GOOD";
    else if (v <= bands!.average) label = "AVERAGE";
    else if (v <= bands!.subpar) label = "SUBPAR";
    else label = "POOR";
  } else {
    if (v >= bands!.excellent) label = "EXCELLENT";
    else if (v >= bands!.good) label = "GOOD";
    else if (v >= bands!.average) label = "AVERAGE";
    else if (v >= bands!.subpar) label = "SUBPAR";
    else label = "POOR";
  }

  const severity =
    label === "EXCELLENT" ? 0.0 :
    label === "GOOD"      ? 0.25 :
    label === "AVERAGE"   ? 0.5 :
    label === "SUBPAR"    ? 0.75 : 1.0;

  return {
    label,
    severity,
    insight: INSIGHT_MESSAGES[metric]?.[label] ?? INSIGHT_MESSAGES.DEFAULT?.[label] ?? "",
  };
}

const INSIGHT_MESSAGES: Record<string, Record<Appreciation, string>> = {
  DEFAULT: {
    EXCELLENT: "Code is concise and easy to reason about.",
    GOOD: "Code is readable with minor complexity.",
    AVERAGE: "Some parts may require extra attention.",
    SUBPAR: "Increased complexity impacts maintainability.",
    POOR: "High complexity causes cognitive load.",
  },
  avgCyclomatic: {
    EXCELLENT: "Low cyclomatic complexity indicates simple code paths.",
    GOOD: "Moderate cyclomatic complexity with manageable branches.",
    AVERAGE: "Cyclomatic complexity suggests some complex logic.",
    SUBPAR: "High cyclomatic complexity may hinder understanding.",
    POOR: "Very high cyclomatic complexity impacts maintainability.",
  },
  avgNesting: {
    EXCELLENT: "Minimal nesting keeps code flat and readable.",
    GOOD: "Slight nesting present but remains clear.",
    AVERAGE: "Noticeable nesting could complicate logic flow.",
    SUBPAR: "Deep nesting increases cognitive load.",
    POOR: "Excessive nesting severely reduces readability.",
  },
  fanOutLocal: {
    EXCELLENT: "Limited dependencies promote modularity.",
    GOOD: "Moderate dependencies with reasonable coupling.",
    AVERAGE: "Higher dependencies may affect modularity.",
    SUBPAR: "Many dependencies increase complexity.",
    POOR: "Excessive dependencies reduce code clarity.",
  },
  tokenDensity: {
    EXCELLENT: "Concise code with optimal token usage.",
    GOOD: "Slightly dense code but generally clear.",
    AVERAGE: "Token density could be reduced for clarity.",
    SUBPAR: "High token density complicates reading.",
    POOR: "Very dense code increases cognitive effort.",
  },
  commentRatio: {
    EXCELLENT: "Well-commented code aids understanding.",
    GOOD: "Adequate comments for most parts.",
    AVERAGE: "Some areas lack sufficient comments.",
    SUBPAR: "Sparse comments reduce code clarity.",
    POOR: "Lack of comments hinders maintainability.",
  },
  // New insights
  avgFunctionLength: {
    EXCELLENT: "Short functions keep logic focused and readable.",
    GOOD: "Functions are reasonably sized.",
    AVERAGE: "Some functions may be growing long.",
    SUBPAR: "Long functions suggest missing decomposition.",
    POOR: "Very long functions hinder testability and understanding.",
  },
  maxFunctionLength: {
    EXCELLENT: "No single function is excessively long.",
    GOOD: "Longest function is still manageable.",
    AVERAGE: "A long function may benefit from splitting.",
    SUBPAR: "A very long function harms readability.",
    POOR: "Extremely long function indicates a refactor target.",
  },
  avgParamCount: {
    EXCELLENT: "Small parameter lists ease comprehension.",
    GOOD: "Most functions have manageable parameters.",
    AVERAGE: "Some functions accept many parameters.",
    SUBPAR: "Large parameter lists reduce clarity.",
    POOR: "Excessive parameters suggest data clumps or missing objects.",
  },
  maxParamCount: {
    EXCELLENT: "No function has an overly long signature.",
    GOOD: "Parameter counts are generally fine.",
    AVERAGE: "At least one function has many parameters.",
    SUBPAR: "Very long signature reduces readability.",
    POOR: "Extreme parameter count – consider refactoring to objects.",
  },
  totalReturnCount: {
    EXCELLENT: "Return paths are limited and clear.",
    GOOD: "Most functions have straightforward exits.",
    AVERAGE: "Several return points exist across the file.",
    SUBPAR: "Numerous returns complicate reasoning.",
    POOR: "Too many return points – consider simplifying flows.",
  },
  exportCount: {
    EXCELLENT: "Focused public surface keeps modules cohesive.",
    GOOD: "Exports are kept to what’s needed.",
    AVERAGE: "Public API is getting wider.",
    SUBPAR: "Many exports hint at low cohesion.",
    POOR: "Very broad public API – consider splitting modules.",
  },
  foreignAccessCount: {
    EXCELLENT: "Encapsulation is respected.",
    GOOD: "Limited access to foreign objects.",
    AVERAGE: "Some functions rely on foreign state.",
    SUBPAR: "High foreign access suggests feature envy.",
    POOR: "Strong feature envy – extract responsibilities.",
  },
  methodCount: {
    EXCELLENT: "Class/file has a focused set of behaviors.",
    GOOD: "Number of methods is reasonable.",
    AVERAGE: "Method count is getting high.",
    SUBPAR: "Many methods suggest SRP pressure.",
    POOR: "God class risk – split responsibilities.",
  },
  maxMethodsPerClass: {
    EXCELLENT: "No class carries too many methods.",
    GOOD: "Largest class is manageable.",
    AVERAGE: "A class is getting large.",
    SUBPAR: "Large class suggests multiple responsibilities.",
    POOR: "Very large class – strong candidate to split.",
  },
  classCount: {
    EXCELLENT: "One class per file maximizes cohesion.",
    GOOD: "Few classes per file is fine.",
    AVERAGE: "Multiple classes in a file reduce focus.",
    SUBPAR: "Many classes – consider separating files.",
    POOR: "Too many classes in one file – split modules.",
  },
};