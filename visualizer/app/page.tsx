import Link from "next/link";
import { listReports, readReport, formatWhen } from "@/lib/reports";
import StatCard from "@/components/StatCard";
import FilesTable from "@/components/FilesTable";

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
              ? <>Showing <span className="font-mono">{latest.filename}</span> &middot; {formatWhen(data?.meta.generatedAt)}</>
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
            <StatCard title="Average score" value={data.summary.avgScore.toFixed(1)} hint="0 is clear; 100 is heavy" />
            <StatCard title="Max fan-out" value={data.summary.maxFanOut} />
            <StatCard title="Top hotspot" value={
              data.summary.hotspots[0]
                ? <span className="font-mono">{data.summary.hotspots[0].file}</span>
                : "—"
            } />
          </section>

          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Available Reports</h2>
              <div className="hint">Pulled from /reports (newest first)</div>
            </div>
            <ul className="mt-3 divide-y divide-white/5">
              {reports.map((r) => (
                <li key={r.filename} className="py-2 flex items-center justify-between">
                  <div className="font-mono text-ink-200">{r.filename}</div>
                  <div className="flex items-center gap-3">
                    <div className="hint">{formatWhen(r.generatedAt)}</div>
                    <Link
                      className="text-sm underline underline-offset-4 decoration-white/20 hover:decoration-white"
                      href={`/report/${encodeURIComponent(r.filename)}`}
                    >
                      Open
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Files</h2>
            <FilesTable files={data.files} />
          </section>
        </>
      )}
    </div>
  );
}
