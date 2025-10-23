"use client";

import clsx from "clsx";

export default function ScoreBadge({ score }: { score: number }) {
  const color =
    score < 30 ? "bg-ok/20 text-ok border-ok/40" :
    score < 60 ? "bg-warn/20 text-warn border-warn/40" :
    "bg-bad/20 text-bad border-bad/40";
  return (
    <span className={clsx("px-2 py-0.5 rounded-full text-xs border", color)}>
      {score}
    </span>
  );
}
