import { Command } from "commander";
import { analyzeProject } from "./core/analyzer.ts";
import { reportResults } from "./output/reporter.ts";

const program = new Command();

program
  .name("tesseract-analyze")
  .argument("<path>", "Path to project folder")
  .action(async (path) => {
    console.log(`🧠 Analyzing codebase at: ${path}\n`);
    const results = await analyzeProject(path);
    reportResults(results);
  });

program.parse(process.argv);