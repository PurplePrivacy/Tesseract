import type { TesseractJson } from "./types";
export declare function listReports(): Promise<Array<{
    filename: string;
    mtimeMs: number;
    generatedAt?: string;
}>>;
export declare function readReport(filename: string): Promise<TesseractJson | null>;
export declare function formatWhen(s?: string): string;
//# sourceMappingURL=reports.d.ts.map