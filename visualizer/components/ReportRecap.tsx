"use client";

export default function ReportRecap({ data }: { data: any }) {
  const files = data.files;

  const groups = {
    critical: files.filter((f: any) => f.metrics.score >= 70),
    medium: files.filter((f: any) => f.metrics.score >= 40 && f.metrics.score < 70),
    low: files.filter((f: any) => f.metrics.score < 40),
  };

  function renderGroup(title: string, emoji: string, color: string, list: any[]) {
    if (!list.length) return null;
    return (
      <div className="mb-4">
        <h3 className={`font-semibold ${color} text-sm mb-1`}>
          {emoji} {title}
        </h3>
        <ul className="text-xs font-mono text-ink-300 space-y-0.5">
          {list
            .sort((a, b) => b.metrics.score - a.metrics.score)
            .slice(0, 8)
            .map((f: any, i: number) => (
              <li key={f.file}>
                {i + 1}. {f.file} (Score: {f.metrics.score}
                {f.metrics.fanIn > 2 ? `, blocks ${f.metrics.fanIn} files` : ""}
                {f.metrics.cyclomatic > 10 ? `, high cyclo` : ""})
              </li>
            ))}
        </ul>
      </div>
    );
  }

  return (
    <section className="mt-6 border-t border-ink-700 pt-4">
      <h2 className="text-lg font-semibold mb-3">Recap</h2>
      {renderGroup("Critical (fix first)", "🔥", "text-red-500", groups.critical)}
      {renderGroup("Medium (refactor soon)", "⚠️", "text-yellow-400", groups.medium)}
      {renderGroup("Low priority", "✅", "text-green-400", groups.low)}
    </section>
  );
}