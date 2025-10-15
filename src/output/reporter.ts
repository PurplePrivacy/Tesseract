import Table from "cli-table3";
import chalk from "chalk";

export function reportResults(results: any[]) {
  const table = new Table({
    head: ["File", "Cyclo", "Nest", "FanIn", "FanOut", "Density", "Score"],
  });

  for (const r of results) {
    const color =
      r.score < 30 ? chalk.green :
      r.score < 60 ? chalk.yellow :
      chalk.red;

    table.push([
      r.file.replace(process.cwd(), "."),
      r.cyclomatic,
      r.nesting,
      r.fanIn ?? 0,
      r.fanOut,
      r.tokenDensity.toFixed(2),
      color(r.score),
    ]);
  }

  console.log(table.toString());

  console.log(chalk.bold("\n📘 Metric Definitions:\n"));
  console.log(`  ${chalk.cyan("Cyclo")}     → Number of branching points (if/for/while)`);
  console.log(`  ${chalk.cyan("Nest")}      → Average code nesting depth`);
  console.log(`  ${chalk.cyan("FanIn")}     → How many files depend on this file`);
  console.log(`  ${chalk.cyan("FanOut")}    → How many files this one imports`);
  console.log(`  ${chalk.cyan("Density")}   → Tokens per line — higher = harder to read`);
  console.log(`  ${chalk.cyan("Score")}     → Weighted composite Cognitive Load Index`);
}