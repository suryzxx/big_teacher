import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const srcRoot = path.join(root, "src");
const sourceExtensions = [".ts", ".tsx", ".js", ".jsx"];
const ignoredDirs = new Set(["node_modules", "dist", ".git"]);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    if (ignoredDirs.has(entry.name)) return [];
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return sourceExtensions.includes(path.extname(entry.name)) ? [fullPath] : [];
  });
}

function normalize(filePath) {
  return path.relative(root, filePath).split(path.sep).join("/");
}

function resolveCandidate(basePath) {
  const extension = path.extname(basePath);
  if (extension && fs.existsSync(basePath)) return basePath;

  for (const extension of sourceExtensions) {
    const filePath = `${basePath}${extension}`;
    if (fs.existsSync(filePath)) return filePath;
  }

  for (const extension of sourceExtensions) {
    const indexPath = path.join(basePath, `index${extension}`);
    if (fs.existsSync(indexPath)) return indexPath;
  }

  return null;
}

function resolveSpecifier(fromFile, specifier) {
  if (specifier.startsWith("@/")) return resolveCandidate(path.join(srcRoot, specifier.slice(2)));
  if (specifier.startsWith(".")) return resolveCandidate(path.resolve(path.dirname(fromFile), specifier));
  return null;
}

function readImports(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  const imports = [];
  const patterns = [
    /\bimport\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g,
    /\bexport\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      imports.push(match[1]);
    }
  }

  return imports;
}

const files = walk(srcRoot);
const graph = new Map(files.map((filePath) => [filePath, []]));
const missingImports = [];

for (const filePath of files) {
  for (const specifier of readImports(filePath)) {
    const resolved = resolveSpecifier(filePath, specifier);
    if (!specifier.startsWith(".") && !specifier.startsWith("@/")) continue;
    if (!resolved) {
      missingImports.push(`${normalize(filePath)} -> ${specifier}`);
      continue;
    }
    if (graph.has(resolved)) graph.get(filePath).push(resolved);
  }
}

const visiting = new Set();
const visited = new Set();
const stack = [];
const cycles = [];
const cycleKeys = new Set();

function visit(filePath) {
  if (visiting.has(filePath)) {
    const start = stack.indexOf(filePath);
    const cycle = [...stack.slice(start), filePath].map(normalize);
    const key = cycle.join(" -> ");
    if (!cycleKeys.has(key)) {
      cycleKeys.add(key);
      cycles.push(cycle);
    }
    return;
  }
  if (visited.has(filePath)) return;

  visiting.add(filePath);
  stack.push(filePath);
  for (const nextFile of graph.get(filePath) ?? []) {
    visit(nextFile);
  }
  stack.pop();
  visiting.delete(filePath);
  visited.add(filePath);
}

for (const filePath of graph.keys()) {
  visit(filePath);
}

if (missingImports.length > 0 || cycles.length > 0) {
  if (missingImports.length > 0) {
    console.error("Missing local imports:");
    for (const missingImport of missingImports) console.error(`  - ${missingImport}`);
  }

  if (cycles.length > 0) {
    console.error("Circular local dependencies:");
    for (const cycle of cycles) console.error(`  - ${cycle.join(" -> ")}`);
  }

  process.exit(1);
}

console.log(`Import graph OK (${files.length} files checked).`);
