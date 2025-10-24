export type Risk = "LOW" | "MEDIUM" | "HIGH";
export type Appreciation = "EXCELLENT" | "GOOD" | "AVERAGE" | "SUBPAR" | "POOR";
export interface GradeResult {
    label: Appreciation;
    severity: number;
    insight?: string;
}
export declare const COLORS: Record<Risk, string>;
export declare const BANDS: {
    avgCyclomatic: {
        excellent: number;
        good: number;
        average: number;
        subpar: number;
    };
    avgNesting: {
        excellent: number;
        good: number;
        average: number;
        subpar: number;
    };
    fanOutLocal: {
        excellent: number;
        good: number;
        average: number;
        subpar: number;
    };
    tokenDensity: {
        excellent: number;
        good: number;
        average: number;
        subpar: number;
    };
    commentRatio: {
        excellent: number;
        good: number;
        average: number;
        subpar: number;
    };
};
export declare function classifyRisk(score: number): Risk;
export declare function grade(value: number, bands: {
    excellent: number;
    good: number;
    average: number;
    subpar: number;
}, higherIsBetter?: boolean, metric?: string): GradeResult;
//# sourceMappingURL=formatter.d.ts.map