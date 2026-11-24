#!/usr/bin/env node
/**
 * Flags Arabic UI text that has no French counterpart.
 *
 * Every Arabic string in src/ must be bilingual, written in one of these forms:
 *   t("عربي", "Français")                      (preferred, see src/i18n.ts)
 *   isArabic ? "عربي" : "Français"            (or language === "ar" ? ...)
 *   { ar: "عربي", fr: "Français" }             (config objects / translations.ts)
 * Lines that are a continuation of such an expression, comments and tests are allowed.
 *
 * Usage: npm run check:i18n
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "src");
const ARABIC = /[؀-ۿ]/;
const SKIP_FILES = [/\.test\.tsx?$/, /translations\.ts$/, /react-app-env\.d\.ts$/];

// A line is OK when it shows it is one side of a bilingual pair.
const OK_LINE = [
  /\bt\(\s*["'`]/, // t("..."
  /\bar\s*:/, // ar: "..."
  /\bisArabic\b/,
  /language\s*===?\s*["']ar["']/,
  /language\s*!==?\s*["']fr["']/,
  /^\s*(\?|:)\s/, // ternary continuation:  ? "..."  /  : "..."
  /^\s*\/\//, // comment
  /^\s*\*/, // block comment
  /\{\/\*.*\*\/\}/, // JSX comment
];

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(tsx?|jsx?)$/.test(entry.name) ? [full] : [];
  });

const problems = [];
for (const file of walk(ROOT)) {
  if (SKIP_FILES.some((re) => re.test(file))) continue;
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    if (!ARABIC.test(line)) return;
    if (OK_LINE.some((re) => re.test(line))) return;
    // Allow the Arabic argument of a t( call that was split over several lines.
    const prev = lines.slice(Math.max(0, i - 6), i);
    if (prev.some((l) => /\bt\(\s*$/.test(l.trimEnd()))) return;
    if (/\?\s*$/.test((prev[prev.length - 1] || "").trimEnd())) return;
    problems.push(`${path.relative(process.cwd(), file)}:${i + 1}: ${line.trim()}`);
  });
}

if (problems.length) {
  console.error(`Found ${problems.length} Arabic-only string(s) without a French version:\n`);
  console.error(problems.join("\n"));
  console.error('\nWrap them as t("عربي", "Français") using useT() from src/i18n.ts.');
  process.exit(1);
}
console.log("check:i18n — every Arabic string has a French counterpart.");
