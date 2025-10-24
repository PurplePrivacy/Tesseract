export const COLORS = {
    LOW: "#27ae60", // green
    MEDIUM: "#f1c40f", // yellow
    HIGH: "#e74c3c", // red
};
export const BANDS = {
    avgCyclomatic: { excellent: 4, good: 7, average: 10, subpar: 15 }, // >15 = POOR
    avgNesting: { excellent: 1, good: 2, average: 3, subpar: 4 }, // >=5 = POOR
    fanOutLocal: { excellent: 3, good: 7, average: 12, subpar: 20 }, // >20 = POOR
    tokenDensity: { excellent: 5, good: 8, average: 12, subpar: 16 }, // >16 = POOR
    commentRatio: { excellent: 15, good: 10, average: 5, subpar: 2 }, // <2% = POOR
};
export function classifyRisk(score) {
    if (score < 30)
        return "LOW";
    if (score < 60)
        return "MEDIUM";
    return "HIGH";
}
export function grade(value, bands, higherIsBetter = false, metric = "DEFAULT") {
    const v = Number.isFinite(value) ? value : 0;
    let label;
    if (!higherIsBetter) {
        if (v <= bands.excellent)
            label = "EXCELLENT";
        else if (v <= bands.good)
            label = "GOOD";
        else if (v <= bands.average)
            label = "AVERAGE";
        else if (v <= bands.subpar)
            label = "SUBPAR";
        else
            label = "POOR";
    }
    else {
        if (v >= bands.excellent)
            label = "EXCELLENT";
        else if (v >= bands.good)
            label = "GOOD";
        else if (v >= bands.average)
            label = "AVERAGE";
        else if (v >= bands.subpar)
            label = "SUBPAR";
        else
            label = "POOR";
    }
    const severity = label === "EXCELLENT" ? 0.0 :
        label === "GOOD" ? 0.25 :
            label === "AVERAGE" ? 0.5 :
                label === "SUBPAR" ? 0.75 : 1.0;
    return {
        label,
        severity,
        insight: INSIGHT_MESSAGES[metric]?.[label] ?? INSIGHT_MESSAGES.DEFAULT?.[label] ?? "",
    };
}
const INSIGHT_MESSAGES = {
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
};
//# sourceMappingURL=formatter.js.map