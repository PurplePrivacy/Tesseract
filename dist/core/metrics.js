export function computeMetrics(parsed) {
    const { source, functions, imports } = parsed;
    // ---- basic text metrics ----
    const text = source.getFullText() || "";
    const loc = Math.max(1, source.getEndLineNumber() || 0); // guard / avoid div-by-zero
    const tokens = (text.match(/\S+/g) || []).length;
    const tokenDensity = tokens / loc;
    // ---- comment ratio (as percentage) ----
    const lineCommentLines = (text.match(/^\s*\/\/.*$/gm) || []).length;
    const blockComments = text.match(/\/\*[\s\S]*?\*\//g) || [];
    const blockCommentLines = blockComments.reduce((sum, block) => {
        const nl = (block.match(/\n/g) || []).length;
        return sum + (nl + 1);
    }, 0);
    const commentLines = lineCommentLines + blockCommentLines;
    const commentRatio = (commentLines / loc) * 100;
    // ---- cyclomatic complexity ----
    // per-function: count decision points + logical ops + 1
    const perFuncCyclo = (functions || []).map((fn) => {
        const body = fn.getBodyText() || "";
        const decisions = (body.match(/\b(if|for|while|case|catch)\b/g) || []).length;
        const logicalOps = (body.match(/(&&|\|\||\?)/g) || []).length; // includes ternary '?'
        return decisions + logicalOps + 1;
    });
    const cyclomatic = perFuncCyclo.reduce((a, b) => a + b, 0);
    const functionCount = (functions || []).length;
    const avgCyclomatic = functionCount ? cyclomatic / functionCount : 0;
    // ---- nesting depth (approximate) ----
    function maxNesting(body) {
        let depth = 0, max = 0;
        for (let i = 0; i < body.length; i++) {
            const ch = body[i];
            if (ch === "{") {
                depth++;
                if (depth > max)
                    max = depth;
            }
            else if (ch === "}") {
                if (depth > 0)
                    depth--;
            }
        }
        // subtract the function's outer block if present
        return Math.max(0, max - 1);
    }
    const perFuncNest = (functions || []).map((fn) => maxNesting(fn.getBodyText() || ""));
    const nesting = perFuncNest.reduce((a, b) => a + b, 0);
    const avgNesting = functionCount ? nesting / functionCount : 0;
    // ---- coupling ----
    const fanOut = (imports || []).length; // all imports (3rd-party + local)
    const fanOutLocal = (imports || []).filter((m) => m.startsWith(".")).length; // local-only
    return {
        // raw counts
        loc,
        tokens,
        functionCount,
        // readability
        tokenDensity,
        commentRatio,
        // complexity
        cyclomatic,
        avgCyclomatic,
        nesting,
        avgNesting,
        // coupling
        fanOut,
        fanOutLocal,
    };
}
//# sourceMappingURL=metrics.js.map