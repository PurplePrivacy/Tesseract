import fs from "fs";
import path from "path";

const distDir = path.resolve("./dist");

// Recursively fix all import statements by appending `.js`
function fixImportsRecursively(dir) {
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      fixImportsRecursively(fullPath);
    } else if (file.endsWith(".js")) {
      let content = fs.readFileSync(fullPath, "utf8");

      // Fix both ./ and ../ imports, skip ones that already end with .js or .json
      content = content.replace(
        /from\s+["']((?:\.\.?\/)[^"']+)(?<!\.js|\.json)["']/g,
        (match, p1) => `from "${p1}.js"`
      );

      fs.writeFileSync(fullPath, content, "utf8");
    }
  }
}

fixImportsRecursively(distDir);
console.log("✅ Fixed ESM imports in dist/*.js (including ../ imports)");