import * as fs from "fs";
import * as path from "path";

// Function to get directory structure recursively
function getDirectoryStructure(dirPath: string, indent: string = ""): string {
  let result = "";
  const items = fs.readdirSync(dirPath);

  items.forEach((item, index) => {
    const itemPath = path.join(dirPath, item);
    const isLast = index === items.length - 1;
    const stats = fs.statSync(itemPath);

    // Skip node_modules directory and .git
    if (item === "node_modules" || item === ".git") {
      return;
    }

    // Add the item to the result
    result += `${indent}${isLast ? "└──" : "├──"} ${item}${
      stats.isDirectory() ? "/" : ""
    }\n`;

    // If it's a directory, get its structure recursively
    if (stats.isDirectory()) {
      result += getDirectoryStructure(
        itemPath,
        indent + (isLast ? "    " : "│   ")
      );
    }
  });

  return result;
}

const projectRoot = process.cwd();
const structureOutput = `MN School Database v2 Directory Structure
=========================================

${getDirectoryStructure(projectRoot)}`;

// Output to console
console.log(structureOutput);

// Write to file
fs.writeFileSync(
  path.join(projectRoot, "folder-structure.txt"),
  structureOutput,
  "utf8"
);

console.log(`\nFolder structure has been written to folder-structure.txt`);
