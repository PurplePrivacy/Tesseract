import React from "react";

export default function ScoringCard() {
  return (
    <section className="card p-5 space-y-3">
      <h2 className="text-lg font-semibold">How this dashboard scores and what the metrics mean</h2>

      <div className="text-sm text-ink-300">
        The <strong>Composite Score</strong> is a 0–100 index where <em>lower</em> indicates easier comprehension.
        It blends Cyclomatic Complexity, Nesting Depth, Fan-Out (local), Token Density, and Comment Ratio,
        normalized into bands and combined to surface hotspots.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="font-semibold mb-1">Cyclomatic Complexity</div>
          <div className="text-sm text-ink-300">
            Decision points across functions. Higher values mean more paths and a larger testing surface.
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="font-semibold mb-1">Nesting Depth</div>
          <div className="text-sm text-ink-300">
            Average depth of nested blocks. Deep indentation increases working-memory load.
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="font-semibold mb-1">Fan-Out (local)</div>
          <div className="text-sm text-ink-300">
            Relative imports count. Indicates how many repo modules this file depends on.
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="font-semibold mb-1">Token Density</div>
          <div className="text-sm text-ink-300">
            Tokens per line. Higher density suggests harder visual parsing and lower skimmability.
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 md:col-span-2">
          <div className="font-semibold mb-1">Comment Ratio</div>
          <div className="text-sm text-ink-300">
            Percentage of comment lines. Higher is usually better for onboarding and maintenance.
          </div>
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="font-semibold mb-1">Scoring formula (overview)</div>
        <div className="text-sm text-ink-300">
          The score emphasizes structural complexity:
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li><strong>Cyclomatic</strong> and <strong>Nesting</strong> have the most influence.</li>
            <li><strong>Fan-Out (local)</strong> and <strong>Token Density</strong> affect coupling/readability.</li>
            <li><strong>Comment Ratio</strong> has a smaller corrective effect.</li>
          </ul>
          Values are banded then blended and mapped to 0–100.
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="font-semibold mb-1">Risk bands</div>
        <div className="text-sm text-ink-300">
          <div className="flex gap-3 mt-2">
            <span className="px-2 py-0.5 rounded-full text-xs border bg-ok/20 text-ok border-ok/40">LOW</span>
            <span className="px-2 py-0.5 rounded-full text-xs border bg-warn/20 text-warn border-warn/40">MEDIUM</span>
            <span className="px-2 py-0.5 rounded-full text-xs border bg-bad/20 text-bad border-bad/40">HIGH</span>
          </div>
          <div className="text-xs text-ink-400 mt-2">
            Used to colorize hotspots and provide quick visual cues. See priorities for refactor ordering.
          </div>
        </div>
      </div>
    </section>
  );
}