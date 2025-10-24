import type { Appreciation, GradeResult } from "../output/formatter";
export type PriorityLevel = "LOW" | "MEDIUM" | "HIGH";
export declare function computePrioritiesForFile(file: {
    score: number;
    fanIn: number;
    avgCyclomatic: number;
    avgNesting: number;
    fanOutLocal: number;
    tokenDensity: number;
    commentRatio: number;
    labels: Record<string, GradeResult>;
}): {
    level: PriorityLevel;
    filePriority: number;
    prioritizedMetrics: {
        metric: "tokenDensity" | "avgCyclomatic" | "avgNesting" | "fanOutLocal" | "commentRatio";
        label: Appreciation | undefined;
        priorityScore: number;
        insight: string;
    }[];
};
//# sourceMappingURL=prioritizer.d.ts.map