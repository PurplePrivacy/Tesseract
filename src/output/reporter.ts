import Table from "cli-table3";
import chalk from "chalk";
import { grade, BANDS } from "./formatter";

export function reportResults(results: any[]) {
  const table = new Table({
    head: [
      "File",
      "Cyclo",
      "Nest",
      "FanIn",
      "FanOut",
      "Density",
      "FnLen",
      "Params",
      "Methods",
      "Exports",
      "Score",
    ],
  });

  // Sort by score desc so hotspots float
  const sorted = [...results].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  for (const r of sorted) {
    const color = r.score < 30 ? chalk.green : r.score < 60 ? chalk.yellow : chalk.red;

    table.push([
      r.file.replace(process.cwd(), "."),
      r.cyclomatic ?? 0,
      r.nesting ?? 0,
      r.fanIn ?? 0,
      r.fanOut ?? 0,
      (r.tokenDensity ?? 0).toFixed(2),
      (r.avgFunctionLength ?? 0).toFixed(1),
      (r.avgParamCount ?? 0).toFixed(1),
      r.methodCount ?? 0,
      r.exportCount ?? 0,
      color(r.score ?? 0),
    ]);
  }

  console.log(table.toString());

  // Definitions
  console.log(chalk.bold("\n📘 Metric Definitions:\n"));
  console.log(`  ${chalk.cyan("Cyclo")}     → Number of branching points (if/for/while)`);
  console.log(`  ${chalk.cyan("Nest")}      → Average code nesting depth`);
  console.log(`  ${chalk.cyan("FanIn")}     → How many files depend on this file`);
  console.log(`  ${chalk.cyan("FanOut")}    → How many files this one imports`);
  console.log(`  ${chalk.cyan("Density")}   → Tokens per line — higher = harder to read`);
  console.log(`  ${chalk.cyan("FnLen")}     → Average function length (lines) — lower is better`);
  console.log(`  ${chalk.cyan("Params")}    → Average parameters per function — lower is better`);
  console.log(`  ${chalk.cyan("Methods")}   → Total methods declared in file — high may indicate SRP pressure`);
  console.log(`  ${chalk.cyan("Exports")}   → Number of exported symbols — high may indicate low cohesion`);
  console.log(`  ${chalk.cyan("Score")}     → Composite Cognitive Load Index (0–100)`);

  // Condensed insights for the top 3 hotspots
  const top = sorted.slice(0, 3);
  if (top.length) {
    console.log(chalk.bold("\n🔎 Top Insights:"));
    for (const r of top) {
      const issues: string[] = [];
      const pushIf = (ok: boolean, label: string) => { if (ok) issues.push(label); };

      const gFnLen = grade(r.avgFunctionLength ?? 0, BANDS.avgFunctionLength, false, "avgFunctionLength");
      const gParams = grade(r.avgParamCount ?? 0, BANDS.avgParamCount, false, "avgParamCount");
      const gMethods = grade(r.methodCount ?? 0, BANDS.methodCount, false, "methodCount");
      const gExports = grade(r.exportCount ?? 0, BANDS.exportCount, false, "exportCount");
      const gForeign = grade(r.foreignAccessCount ?? 0, BANDS.foreignAccessCount, false, "foreignAccessCount");
      const gReturns = grade(r.totalReturnCount ?? 0, BANDS.totalReturnCount, false, "totalReturnCount");

      pushIf(gFnLen.label === "SUBPAR" || gFnLen.label === "POOR", `Long functions (${gFnLen.label})`);
      pushIf(gParams.label === "SUBPAR" || gParams.label === "POOR", `Large parameter lists (${gParams.label})`);
      pushIf(gMethods.label === "SUBPAR" || gMethods.label === "POOR", `Many methods (${gMethods.label})`);
      pushIf(gExports.label === "SUBPAR" || gExports.label === "POOR", `Many exports (${gExports.label})`);
      pushIf(gForeign.label === "SUBPAR" || gForeign.label === "POOR", `Feature envy (${gForeign.label})`);
      pushIf(gReturns.label === "SUBPAR" || gReturns.label === "POOR", `Many return points (${gReturns.label})`);

      const fileShort = r.file.replace(process.cwd(), ".");
      console.log(`  • ${fileShort}: ${issues.length ? issues.join(" | ") : "Looks healthy."}`);
    }
  }
}