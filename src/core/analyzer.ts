// src/core/analyzer.ts
import fs from "fs";
import path from "path";
import * as ts from "typescript";
import { parseFile } from "./parser";
import { computeMetrics } from "./metrics";
import { computeScore } from "./scorer";

const DEFAULT_IGNORED_DIRS = [
  "node_modules",
  "dist",
  "build",
  ".next",
  ".nuxt",
  ".turbo",
  ".vercel",
  "coverage",
  "out",
  "public"
];

/** Helper: compute per-file structural metrics without changing core metric pipeline */
function computeStructuralMetrics(filePath: string): {
  functionCount: number;
  avgFunctionLength: number;
  maxFunctionLength: number;
  avgParamCount: number;
  maxParamCount: number;
  totalReturnCount: number;
  exportCount: number;
  foreignAccessCount: number;
  methodCount: number;
  maxMethodsPerClass: number;
  classCount: number;
} {
  const code = fs.readFileSync(filePath, "utf8");
  const sf = ts.createSourceFile(filePath, code, ts.ScriptTarget.Latest, /*setParentNodes*/ true);

  const lineOf = (pos: number) => sf.getLineAndCharacterOfPosition(pos).line;

  let functionCount = 0;
  const functionLengths: number[] = [];
  const paramCounts: number[] = [];
  let totalReturnCount = 0;
  let exportCount = 0;
  let foreignAccessCount = 0;
  let methodCount = 0;
  let classCount = 0;
  let maxMethodsPerClass = 0;

  function isFunctionLike(node: ts.Node): node is ts.FunctionLikeDeclaration | ts.ArrowFunction | ts.FunctionExpression {
    return ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node) || ts.isGetAccessor(node) || ts.isSetAccessor(node);
  }

  function countReturns(node: ts.Node) {
    if (ts.isReturnStatement(node)) totalReturnCount += 1;
    node.forEachChild(countReturns);
  }

  function visit(node: ts.Node) {
    // exports
    if (
      (node?..modifiers && node.modifiers.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) ||
      ts.isExportDeclaration(node) ||
      ts.isExportAssignment(node)
    ) {
      exportCount += 1;
    }

    // class + method counting
    if (ts.isClassDeclaration(node)) {
      classCount += 1;
      let localMethodCount = 0;
      node.members.forEach(m => {
        if (ts.isMethodDeclaration(m) || ts.isGetAccessor(m) || ts.isSetAccessor(m) || ts.isConstructorDeclaration(m)) {
          localMethodCount += 1;
        }
      });
      methodCount += localMethodCount;
      if (localMethodCount > maxMethodsPerClass) maxMethodsPerClass = localMethodCount;
    }

    // function-like metrics
    if (isFunctionLike(node)) {
      functionCount += 1;

      const startLine = lineOf(node.getStart(sf));
      const endLine = lineOf(node.end);
      functionLengths.push(Math.max(0, endLine - startLine + 1));

      // parameters
      const params = (node as ts.FunctionLikeDeclarationBase).parameters ?? [];
      paramCounts.push(params.length);

      // count returns within this function body only (if present)
      if (node.body) countReturns(node.body);
    }

    // foreign member access: something.other, excluding this.other & super.other
    if (ts.isPropertyAccessExpression(node)) {
      const expr = node.expression;
      if (expr.kind !== ts.SyntaxKind.ThisKeyword && expr.kind !== ts.SyntaxKind.SuperKeyword) {
        foreignAccessCount += 1;
      }
    }

    node.forEachChild(visit);
  }

  visit(sf);

  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
  const max = (arr: number[]) => (arr.length ? Math.max(...arr) : 0);

  return {
    functionCount,
    avgFunctionLength: Number(avg(functionLengths).toFixed(2)),
    maxFunctionLength: max(functionLengths),
    avgParamCount: Number(avg(paramCounts).toFixed(2)),
    maxParamCount: max(paramCounts),
    totalReturnCount,
    exportCount,
    foreignAccessCount,
    methodCount,
    maxMethodsPerClass,
    classCount,
  };
}

export async function analyzeProject(basePath: string) {
  const files: string[] = [];

  // Recursively collect .ts/.tsx/.js files AS ABSOLUTE PATHS
  function collectFiles(dir: string) {
    for (const f of fs.readdirSync(dir)) {
      if (DEFAULT_IGNORED_DIRS.includes(f)) continue;
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) {
        collectFiles(p);
      } else if (p.endsWith(".ts") || p.endsWith(".tsx") || p.endsWith(".js")) {
        files.push(path.resolve(p));
      }
    }
  }

  collectFiles(basePath);

  // Phase 1: parse all files and collect imports
  const parsedResults = files.map((file) => ({
    file, // absolute path
    parsed: parseFile(file),
  }));

  // Phase 2: build reverse dependency map (for fanIn)
  const reverseDeps: Record<string, number> = {};

  // Resolve relative imports to actual files (support .ts/.tsx/.js and index files)
  function resolveImport(baseDir: string, dep: string): string | null {
    if (!dep.startsWith(".")) return null; // skip node_modules etc.
    const candidates = [
      path.resolve(baseDir, dep),
      path.resolve(baseDir, dep + ".ts"),
      path.resolve(baseDir, dep + ".tsx"),
      path.resolve(baseDir, dep + ".js"),
      path.resolve(baseDir, dep, "index.ts"),
      path.resolve(baseDir, dep, "index.tsx"),
      path.resolve(baseDir, dep, "index.js"),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return path.normalize(c);
    }
    return null;
  }

  for (const { file, parsed } of parsedResults) {
    const fileDir = path.dirname(file);
    for (const dep of parsed.imports) {
      const resolved = resolveImport(fileDir, dep);
      if (resolved) {
        const key = path.normalize(resolved);
        reverseDeps[key] = (reverseDeps[key] || 0) + 1;
      }
    }
  }

  // Phase 3: compute metrics and scores
  const results: any[] = [];
  for (const { file, parsed } of parsedResults) {
    const baseMetrics = computeMetrics(parsed);
    const structural = computeStructuralMetrics(file);

    const key = path.normalize(file);
    const fanIn = reverseDeps[key] || 0;

    // Merge all metrics for scoring
    const combinedMetrics = { ...baseMetrics, ...structural, fanIn } as any;
    const score = computeScore(combinedMetrics);

    results.push({ file, ...combinedMetrics, score });
  }

  return results;
}