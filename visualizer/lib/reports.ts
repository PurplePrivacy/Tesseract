import fs from "fs";
import path from "path";
import { z } from "zod";
import type { TesseractJson } from "./types";

const REPORTS_DIR = process.env.TESSERACT_REPORTS_DIR
  ? path.resolve(process.env.TESSERACT_REPORTS_DIR)
  : path.resolve(process.cwd(), "..", "reports");

// Very light check to avoid path traversal
function safeJoinReports(name: string) {
  const base = path.basename(name);
  return path.join(REPORTS_DIR, base);
}

export async function listReports(): Promise<
  Array<{ filename: string; mtimeMs: number; generatedAt?: string }>
> {
  try {
    const files = await fs.promises.readdir(REPORTS_DIR);
    const jsons = files.filter((f) => f.endsWith(".json"));
    const stats = await Promise.all(
      jsons.map(async (f) => {
        const full = path.join(REPORTS_DIR, f);
        const st = await fs.promises.stat(full);
        let generatedAt: string | undefined;
        try {
          const buf = await fs.promises.readFile(full, "utf8");
          const match = buf.match(/"generatedAt"\s*:\s*"([^"]+)"/);
          if (match) generatedAt = match[1];
        } catch {}
        return { filename: f, mtimeMs: st.mtimeMs, generatedAt };
      })
    );
    stats.sort((a, b) => (b.generatedAt ? Date.parse(b.generatedAt) : b.mtimeMs) - (a.generatedAt ? Date.parse(a.generatedAt) : a.mtimeMs));
    return stats;
  } catch {
    return [];
  }
}

export async function readReport(filename: string): Promise<TesseractJson | null> {
  try {
    const full = safeJoinReports(filename);
    const text = await fs.promises.readFile(full, "utf8");
    const data = JSON.parse(text) as TesseractJson;
    const meta = z.object({
      generatedAt: z.string(),
      reportFilename: z.string(),
      basePath: z.string(),
      version: z.string()
    });
    meta.parse(data.meta);
    return data;
  } catch {
    return null;
  }
}

export function formatWhen(s?: string) {
  if (!s) return "unknown";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString();
}
