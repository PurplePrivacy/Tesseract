"use client";

import { useMemo, useState } from "react";
import type { ReportFileEntry } from "@/lib/types";
import ScoreBadge from "./ScoreBadge";
import MetricPill from "./MetricPill";

export default function FilesTable({ files }: { files: ReportFileEntry[] }) {
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<string>("score");

  const filtered = useMemo(() => {
    const f = q.trim().toLowerCase();
    const base = f ? files.filter((x) => x.file.toLowerCase().includes(f)) : files;
    return [...base].sort((a, b) => (((b.metrics as any)[sortKey] ?? 0) as number) - (((a.metrics as any)[sortKey] ?? 0) as number));
  }, [files, q, sortKey]);

  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-4">
        <input
          placeholder="Search files…"
          className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/20"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm"
          value={sortKey as string}
          onChange={(e) => setSortKey(e.target.value as any)}
        >
          <option value="score">Score</option>
          <option value="avgCyclomatic">Avg Cyclomatic</option>
          <option value="avgNesting">Avg Nesting</option>
          <option value="fanIn">FanIn</option>
          <option value="fanOutLocal">FanOut (local)</option>
          <option value="tokenDensity">Token Density</option>
          <option value="avgFunctionLength">Avg Function Length</option>
          <option value="maxFunctionLength">Max Function Length</option>
          <option value="avgParamCount">Avg Param Count</option>
          <option value="maxParamCount">Max Param Count</option>
          <option value="methodCount">Method Count</option>
          <option value="maxMethodsPerClass">Max Methods / Class</option>
          <option value="exportCount">Export Count</option>
          <option value="totalReturnCount">Return Count</option>
          <option value="foreignAccessCount">Foreign Access Count</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-ink-400">
            <tr>
              <th className="text-left p-2">File</th>
              <th className="text-right p-2">Score</th>
              <th className="text-right p-2">Avg Cyclo</th>
              <th className="text-right p-2">Avg Nest</th>
              <th className="text-right p-2">FanIn</th>
              <th className="text-right p-2">FanOut (local)</th>
              <th className="text-right p-2">Density</th>
              <th className="text-right p-2">FnLen (avg)</th>
              <th className="text-right p-2">Params (avg)</th>
              <th className="text-right p-2">Methods</th>
              <th className="text-right p-2">Exports</th>
              <th className="text-right p-2">Primary Fix</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr key={f.file} className="border-t border-white/5 hover:bg-white/5">
                <td className="p-2 font-mono text-ink-200">{f.file}</td>
                <td className="p-2 text-right"><ScoreBadge score={f.metrics.score} /></td>
                <td className="p-2 text-right">{f.metrics.avgCyclomatic.toFixed(1)}</td>
                <td className="p-2 text-right">{f.metrics.avgNesting.toFixed(1)}</td>
                <td className="p-2 text-right">{f.metrics.fanIn}</td>
                <td className="p-2 text-right">{f.metrics.fanOutLocal}</td>
                <td className="p-2 text-right">{f.metrics.tokenDensity.toFixed(2)}</td>
                <td className="p-2 text-right">{((f.metrics as any).avgFunctionLength ?? 0).toFixed ? ((f.metrics as any).avgFunctionLength as number)?.toFixed(1) : ((f.metrics as any).avgFunctionLength ?? "—")}</td>
                <td className="p-2 text-right">{((f.metrics as any).avgParamCount ?? 0).toFixed ? ((f.metrics as any).avgParamCount as number)?.toFixed(1) : ((f.metrics as any).avgParamCount ?? "—")}</td>
                <td className="p-2 text-right">{(f.metrics as any).methodCount ?? "—"}</td>
                <td className="p-2 text-right">{(f.metrics as any).exportCount ?? "—"}</td>
                <td className="p-2 text-right">
                  {(() => {
                    // Try to find a prioritized metric matching the current sortKey
                    const pm = f.priority.prioritizedMetrics.find(m => m.metric === sortKey);
                    // Fall back to the top priority if no direct match
                    const fallback = f.priority.prioritizedMetrics[0];
                    const active = pm || fallback;
                    const activeLabel = active?.label ?? "GOOD";
                    const activeInsight = active?.insight || "—";
                    return (
                      <>
                        <MetricPill label={activeLabel} />
                        <span className="ml-2 text-ink-400">{activeInsight}</span>
                      </>
                    );
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
