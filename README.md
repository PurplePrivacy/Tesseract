

# Tesseract — Cognitive & Architectural Compass for Codebases

Tesseract helps you **see where thinking gets hard** in a TypeScript/JavaScript codebase.  
Unlike linters (syntax/style) or generic code smells, Tesseract focuses on **cognitive load**, **coupling**, and **architecture health** using a **project-wide import graph**.

> **Status:** MVP metrics & CLI are working (table output).  
> **Next:** JSON/PDF reports, dead code reachability, orphan exports, cycles, instability.

---

## ✨ What It Does (Today)

Runs a static analysis over your TS/JS project and reports per-file metrics:

- **Cyclomatic Complexity** — branching points (`if/for/while/switch/&&/||`) aggregated per file
- **Nesting Depth** — approximation of average nested block depth
- **Fan-Out** — number of imports in a file (currently **all** imports, incl. third‑party)
- **Fan-In** — how many other files import this file (local dependency graph)
- **Token Density** — tokens per line (visual density proxy)
- **Score** — weighted composite (0–100) approximating **cognitive load**

Example output:
```
npx tsx src/cli.ts ./src

┌───────────────────────────┬───────┬──────┬───────┬────────┬─────────┬───────┐
│ File                      │ Cyclo │ Nest │ FanIn │ FanOut │ Density │ Score │
├───────────────────────────┼───────┼──────┼───────┼────────┼─────────┼───────┤
│ ./src/cli.ts              │ 0     │ 0    │ 0     │ 3      │ 2.94    │ 1     │
│ ./src/core/analyzer.ts    │ 12    │ 0    │ 1     │ 5      │ 3.86    │ 6     │
│ ./src/core/metrics.ts     │ 6     │ 0    │ 1     │ 0      │ 4.35    │ 3     │
│ ./src/core/parser.ts      │ 1     │ 0    │ 1     │ 1      │ 2.83    │ 1     │
│ ./src/core/scorer.ts      │ 1     │ 0    │ 1     │ 0      │ 4.00    │ 1     │
│ ./src/output/reporter.ts  │ 5     │ 0    │ 1     │ 2      │ 3.46    │ 3     │
└───────────────────────────┴───────┴──────┴───────┴────────┴─────────┴───────┘
```

---

## 🧭 Why It’s Different (State of the Art)

- **ESLint** excels at *file‑local* rules (unused vars/imports, style, safety).  
  Tesseract focuses on **project-wide** cognition and architecture signals.
- **SonarQube** surfaces code smells & coverage.  
  Tesseract adds a **graph perspective** (fan‑in/out, reachability, cycles soon) and **cognitive weighting** to prioritize *what to refactor first*.
- **Dependency graph tools** show links; Tesseract combines **graph + complexity** to identify **hotspots** (high load + high coupling).

**Positioning:** a **Refactoring Compass** that guides legacy migrations and Clean Architecture / DDD alignment.

---

## 🚀 Quick Start

**Requirements:** Node 18+ (Node 20+ recommended), npm.

```bash
# install dependencies
npm install

# run analysis against your 'src' folder
npx tsx src/cli.ts ./src
```

By default, Tesseract scans recursively for `.ts` and `.js` files.

### CLI Options (current)
- `<path>`: folder to analyze (e.g., `./src`)

> Upcoming flags (next iteration):
> - `--out <dir>`: reports output directory (default `report/`)  
> - `--json <file>` / `--pdf <file>`: override output paths  
> - `--no-json` / `--no-pdf`: disable a report type

---

## 🧠 Metric Definitions

| Metric | What it measures | Why it matters |
|---|---|---|
| **Cyclomatic** | Total decision points across functions | More paths → harder reasoning & testing |
| **Nesting** | Approx. average nested block depth | Indentation increases mental effort |
| **Fan‑Out** | Count of imports (local **and** third‑party, today) | Coupling & outward dependencies |
| **Fan‑In** | Count of files that import this file (local graph) | Indicates *how many depend on you* |
| **Token Density** | Tokens per line | Visual parsing difficulty |
| **Score** | Weighted composite (0–100) | Single “load” index for prioritization |

**Risk Bands (Score):**

- 🟢 **0–29** — Clear  
- 🟡 **30–59** — Manageable  
- 🔴 **60–100** — Heavy (consider refactor)

> Note: thresholds will be tuned with real‑world datasets.

---

## 🧩 How Fan‑In / Fan‑Out Are Computed

- **Fan‑Out:** count of `import … from "<specifier>"` statements in a file (currently includes third‑party and local).  
  *Planned:* `--local-only` to restrict Fan‑Out to relative (`./`/`../`) imports.
- **Fan‑In:** number of files that import this file. We resolve relative module specifiers to actual files using these candidates:
  - `dep`, `dep.ts`, `dep.js`, `dep/index.ts`, `dep/index.js`
  - Non‑relative imports (e.g. `"react"`, `"fs"`) are ignored for Fan‑In.

---

## 📦 Project Layout

```
src/
  cli.ts                # CLI entry
  core/
    parser.ts           # ts-morph source loading & import collection
    metrics.ts          # metric computations
    scorer.ts           # composite score weighting
    analyzer.ts         # orchestrates parse → metrics → score
  output/
    reporter.ts         # CLI table rendering
    formatter.ts        # risk bands, colors, benchmarks (extensible)
```

---

## 🧪 Current Limitations

- Cyclomatic & nesting are **first‑pass approximations** (AST‑aware upgrades planned).
- Fan‑Out includes third‑party imports by default (may inflate coupling; configurable soon).
- Fan‑In only tracks **relative** imports (by design); workspace/TSPath aliases require mapping (planned).
- No JSON/PDF reports in `main` yet — tracked in *Next* (see roadmap).

---

## 🛣️ Roadmap (Next Iterations)

1. **Reports**
   - JSON report writer (summary + per‑file), default `report/cognitive-report.json`
   - PDF report (legend, benchmarks, hotspots, full listing), default `report/cognitive-report.pdf`
2. **Graph & Architecture**
   - **Dead Modules** (unreachable from configured entry points)
   - **Orphan Exports** (exported but unused across project)
   - **Cycles** (SCC detection) and **cycle mass**
   - **Instability** `I = fanOut / (fanIn + fanOut)` + outlier surfacing
3. **Config**
   - `.tesseract.json`: entry points, ignore globs, analysis depth, local‑only fan‑out
   - TS path alias resolution (`paths`/`baseUrl`)
4. **Quality**
   - AST‑level cognitive complexity improvements
   - Performance profiling for large repos

---

## 🔧 Development

Useful commands during development:
```bash
# run analysis against this repo
npx tsx src/cli.ts ./src

# typecheck
npx tsc --noEmit
```

**Tech:** TypeScript, ts‑morph, commander, cli‑table3.

---

## 🤝 Contributing

PRs welcome! Please keep changes small and focused.  
- Prefer adding metrics behind flags/config.  
- Include before/after examples for any scoring change.  
- Mind performance (avoid O(N²) surprises on large graphs).

*(CONTRIBUTING.md coming soon)*

---

## 📄 License

MIT — see `LICENSE` (to be added).