#!/usr/bin/env node
/**
 * Repository integrity check used by `make check` and CI.
 * Confirms the expected project files exist and that index.html is coherent.
 */
import { existsSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkHtml } from "./check-html.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const required = [
  "index.html",
  "css/styles.css",
  "js/app.js",
  "js/data.js",
  "assets/farm-live.jpg",
  "assets/scene-crop.png",
  "README.md",
  "LICENSE",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "CODE_OF_CONDUCT.md",
  "SECURITY.md",
  ".gitignore",
  ".gitattributes",
  ".dockerignore",
  ".editorconfig",
  "Dockerfile",
  "docker-compose.yml",
  "nginx.conf",
  "nginx-main.conf",
  "Makefile",
  ".github/workflows/ci.yml",
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/feature_request.yml",
  ".github/pull_request_template.md"
];

const errors = [];

required.forEach((file) => {
  const path = resolve(root, file);
  if (!existsSync(path)) {
    errors.push(`missing required file: ${file}`);
    return;
  }
  if (statSync(path).size === 0) errors.push(`empty file: ${file}`);
});

const { errors: htmlErrors, notes } = checkHtml();
errors.push(...htmlErrors);

console.log("Repository check");
console.log(`  · ${required.length} required files present`);
notes.forEach((n) => console.log(`  · ${n}`));

if (errors.length) {
  console.error("\n✖ checks failed:");
  errors.forEach((e) => console.error(`  · ${e}`));
  process.exit(1);
}

console.log("\n✔ all checks passed");
