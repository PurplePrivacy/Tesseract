export function computeMetrics(parsed: any) {
  const { source, functions, imports } = parsed;

  const loc = source.getEndLineNumber();
  const tokens = source.getFullText().split(/\s+/).length;
  const tokenDensity = tokens / loc;

  const cyclomatic = functions.reduce((sum: number, fn: any) => {
    const body = fn.getBodyText() || "";
    const branches = (body.match(/\b(if|for|while|case|catch|&&|\|\|)\b/g) || []).length;
    return sum + branches + 1;
  }, 0);

  const nesting = functions.reduce((sum: number, fn: any) => {
    const body = fn.getBodyText() || "";
    const depth = (body.match(/{/g) || []).length - (body.match(/}/g) || []).length;
    return sum + Math.max(0, depth);
  }, 0);

  const fanOut = imports.length;

  return { cyclomatic, nesting, fanOut, tokenDensity };
}