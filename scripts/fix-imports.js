import fs from "fs";
import path from "path";

const distDir = path.resolve("./dist");


function fixImportsRecursively(dir) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      fixImportsRecursively(full);
    } else if (file.endsWith(".js")) {
      let content = fs.readFileSync(full, "utf8");
      content = content.replace(
        /from\s+["'](\.\/[^"']+)["']/g,
        (match, p1) => `from "${p1}.js"`
      );
      fs.writeFileSync(full, content, "utf8");
    }
  }
}

fixImportsRecursively(distDir);
console.log("✅ Fixed ESM imports in dist/*.js");