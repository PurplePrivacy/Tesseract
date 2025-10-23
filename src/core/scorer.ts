export function computeScore(m: any) {
  const { cyclomatic, nesting, fanOut, tokenDensity } = m;

  // Define weights — heavier penalties for fanOut and nesting
  const weights = {
    cyclomatic: 1.8,
    nesting: 2.2,
    fanOut: 2.5,
    tokenDensity: 1.5,
  };

  // Apply scaling with diminishing returns using log-based and capped values
  const raw =
    weights.cyclomatic * Math.min(10, cyclomatic) +
    weights.nesting * Math.min(6, nesting) +
    weights.fanOut * Math.log2(fanOut + 1) * 5 +
    weights.tokenDensity * tokenDensity;

  // Normalize and scale to 0–100 range
  const normalized = Math.min(100, Math.round(raw * 1.3));

  return normalized;
}