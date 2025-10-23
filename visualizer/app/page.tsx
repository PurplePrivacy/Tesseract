import Link from "next/link";
import { listReports, readReport, formatWhen } from "@/lib/reports";
import StatCard from "@/components/StatCard";
import FilesTable from "@/components/FilesTable";
import ScoringCard from "@/components/ScoringCard";
import SummaryInsight from "@/components/SummaryInsight";


export default async function Page() {
  const reports = await listReports();
  const latest = reports[0];
  const data = latest ? await readReport(latest.filename) : null;

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
              title="Average score"
              value={data.summary.avgScore.toFixed(1)}
              hint="Composite index (0–100). Lower indicates less cognitive load."
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