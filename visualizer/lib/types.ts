export type Appreciation = "EXCELLENT" | "GOOD" | "AVERAGE" | "SUBPAR" | "POOR";
export type Risk = "LOW" | "MEDIUM" | "HIGH";

export interface GradeResult {
  label: Appreciation;
  severity: number;
  insight?: string;
}

export interface ReportFileEntry {
  file: string;
  metrics: {
    loc: number;
    functionCount: number;
    cyclomatic: number;
    avgCyclomatic: number;
    nesting: number;
    avgNesting: number;
    fanIn: number;
    fanOut: number;
    fanOutLocal: number;
    tokenDensity: number;
    commentRatio: number;
    score: number;
    risk: Risk;
  };
  labels: {
    avgCyclomatic: GradeResult;
    avgNesting: GradeResult;
    fanOutLocal: GradeResult;
    tokenDensity: GradeResult;
    commentRatio: GradeResult;
  };
  priority: {
    level: "LOW" | "MEDIUM" | "HIGH";
    filePriority: number;
    prioritizedMetrics: Array<{ metric: string; label: Appreciation; priorityScore: number; insight?: string; }>;
  };
}

export interface TesseractJson {
  meta: {
    generatedAt: string;
    reportFilename: string;
    basePath: string;
    version: string;
  };
  summary: {
    totalFiles: number;
    avgScore: number;
    maxFanOut: number;
    hotspots: Array<{ file: string; score: number }>;
    countsByLabel: Record<string, Record<Appreciation, number>>;
    priorityTop: Array<{
      file: string;
      level: "LOW" | "MEDIUM" | "HIGH";
      filePriority: number;
      topMetric: { metric: string; label: Appreciation; priorityScore: number };
    }>;
  };
  files: ReportFileEntry[];
}
