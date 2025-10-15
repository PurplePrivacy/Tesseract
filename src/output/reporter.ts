import Table from "cli-table3";
import chalk from "chalk";

export function reportResults(results: any[]) {
  const table = new Table({
    head: ["File", "Cyclo", "Nest", "FanOut", "Density", "Score"],
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
      r.fanOut,
      r.tokenDensity.toFixed(2),
      color(r.score),
    ]);
  }

  console.log(table.toString());
}