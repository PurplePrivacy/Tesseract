import Link from "next/link";
import { listReports, readReport, formatWhen } from "@/lib/reports";
import StatCard from "@/components/StatCard";
import FilesTable from "@/components/FilesTable";
import ScoringCard from "@/components/ScoringCard";
import SummaryInsight from "@/components/SummaryInsight";
import ReportRecap from "@/components/ReportRecap";


export default async function Page() {
  const reports = await listReports();
  const latest = reports[0];
  const data = latest ? await readReport(latest.filename) : null;

  function getScoreColor(score: number) {
    if (score < 20) return "text-green-400";      // Clear
    if (score < 40) return "text-green-300";      // Stable
    if (score < 60) return "text-yellow-400";     // Moderate
    if (score < 80) return "text-orange-400";     // Complex
    return "text-red-500";                        // Critical
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Latest Report</h1>
          <div className="hint">
            {latest
              ? <>Showing <span className="italic text-ink-400">{latest.filename}</span> · {formatWhen(data?.meta.generatedAt)}</>
              : "No reports found in /reports"}
          </div>
        </div>
        <div className="text-sm">
          <Link href="/" className="underline underline-offset-4 decoration-white/20 hover:decoration-white">
            Refresh
          </Link>
        </div>
      </div>

      {data && (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Files analyzed" value={data.summary.totalFiles} />
            <StatCard
              title="Average Score"
              value={
                <div className="flex flex-col items-center bg-gradient-to-b from-ink-900/30 to-ink-700/10 rounded-lg py-2 px-1 w-full">
                  <span className={`text-3xl font-semibold ${getScoreColor(data.summary.avgScore)}`}>
                    {data.summary.avgScore.toFixed(1)}
                  </span>
                  <span className="text-xs text-ink-400 mt-1">Composite index (0–100)</span>
                </div>
              }
              hint={
                <div className="text-xs mt-2 leading-relaxed text-ink-400">
                  📈 <span className="font-medium text-ink-300">Industry Average:</span> 60–70<br />
                  🎯 <span className="font-medium text-ink-300">Clean Code Target:</span> &lt;35<br />
                  ⭐ <span className="font-medium text-ink-300">Excellent:</span> &lt;25
                </div>
              }
            />
            <StatCard title="Max fan-out" value={data.summary.maxFanOut} />
            <StatCard
              title="Top hotspot"
              value={
                data.summary.hotspots[0]
                  ? <span
                      className="font-mono text-xs block max-w-[16rem] truncate"
                      title={data.summary.hotspots[0].file}
                    >
                      {data.summary.hotspots[0].file}
                    </span>
                  : "—"
              }
            />
          </section>
                        <SummaryInsight data={data} />

          <section>
            <ReportRecap data={data} />
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Files</h2>
            <FilesTable files={data.files} />
          </section>

          {/* New: metrics + scoring explainer */}
          <ScoringCard />
        </>
      )}
    </div>
  );
}