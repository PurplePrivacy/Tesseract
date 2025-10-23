import { readReport, formatWhen } from "@/lib/reports";
import FilesTable from "@/components/FilesTable";
import StatCard from "@/components/StatCard";
import Link from "next/link";

export default async function ReportPage({ params }: { params: { name: string } }) {
  const fetched = await params;
  const name = decodeURIComponent(fetched.name);
  const data = await readReport(name);

  if (!data) {
    return (
      <div className="card p-6">
        <div className="text-lg font-semibold">Report not found</div>
        <div className="hint mt-1">Tried reading: {name}</div>
        <Link href="/" className="mt-4 inline-block underline underline-offset-4">Back</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{data.meta.reportFilename}</h1>
          <div className="hint">{formatWhen(data.meta.generatedAt)} &middot; Base: {data.meta.basePath}</div>
        </div>
        <Link href="/" className="text-sm underline underline-offset-4 decoration-white/20 hover:decoration-white">Back to latest</Link>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Files analyzed" value={data.summary.totalFiles} />
        <StatCard title="Average score" value={data.summary.avgScore.toFixed(1)} />
        <StatCard title="Max fan-out" value={data.summary.maxFanOut} />
        <StatCard title="Top hotspot" value={
          data.summary.hotspots[0]
            ? <span className="font-mono">{data.summary.hotspots[0].file}</span>
            : "—"
        } />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Files</h2>
        <FilesTable files={data.files} />
      </section>

      <section className="card p-5">
        <h2 className="text-lg font-semibold">Top Priorities</h2>
        <ul className="mt-3 space-y-2">
          {data.summary.priorityTop.map((p, i) => (
            <li key={i} className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="font-mono">{p.file}</div>
              <div className="text-sm text-ink-300">
                {p.topMetric.metric} &middot; {p.topMetric.label} &middot; score {p.topMetric.priorityScore}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}