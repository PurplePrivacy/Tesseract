"use client";

import clsx from "clsx";

type Props = { label: "EXCELLENT"|"GOOD"|"AVERAGE"|"SUBPAR"|"POOR" };

export default function MetricPill({ label }: Props) {
  const map: Record<Props["label"], string> = {
    EXCELLENT: "bg-ok/15 text-ok border-ok/40",
    GOOD: "bg-ok/10 text-ok border-ok/30",
    AVERAGE: "bg-warn/15 text-warn border-warn/40",
    SUBPAR: "bg-bad/15 text-bad border-bad/40",
    POOR: "bg-bad/25 text-bad border-bad/50"
  };
  return (
    <span className={clsx("px-2 py-0.5 rounded-full text-xs border", map[label])}>
      {label}
    </span>
  );
}
