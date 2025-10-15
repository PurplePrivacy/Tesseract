export function computeScore(m: any) {
  const { cyclomatic, nesting, fanOut, tokenDensity } = m;
  const score =
    0.3 * cyclomatic +
    0.25 * nesting +
    0.2 * fanOut +
    0.25 * tokenDensity;
  return Math.min(100, Math.round(score));
}