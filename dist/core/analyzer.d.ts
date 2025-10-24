export declare function analyzeProject(basePath: string): Promise<{
    fanIn: number;
    score: number;
    loc: number;
    tokens: any;
    functionCount: any;
    tokenDensity: number;
    commentRatio: number;
    cyclomatic: any;
    avgCyclomatic: number;
    nesting: any;
    avgNesting: number;
    fanOut: any;
    fanOutLocal: any;
    file: string;
}[]>;
//# sourceMappingURL=analyzer.d.ts.map