#!/usr/bin/env node
/**
 * Dependency-free structural checks for index.html.
 * Verifies IDs, icon references, routes and local asset paths.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(resolve(root, p), "utf8");

export function checkHtml() {
  const html = read("index.html");
  const errors = [];
  const notes = [];

  const matches = (re) => [...html.matchAll(re)].map((m) => m[1]);

  // 1. no duplicate element ids
  const ids = matches(/\sid="([^"]+)"/g);
  const seen = new Set();
  ids.forEach((id) => {
    if (seen.has(id)) errors.push(`duplicate id "${id}"`);
    seen.add(id);
  });
  notes.push(`${ids.length} unique element ids`);

  // 2. every <use href="#icon"> resolves to a <symbol>
  const symbols = new Set(matches(/<symbol id="([^"]+)"/g));
  const uses = [...new Set(matches(/<use href="#([^"]+)"/g))];
  uses.forEach((icon) => {
    if (!symbols.has(icon)) errors.push(`icon "${icon}" is referenced but not defined`);
  });
  notes.push(`${symbols.size} icons defined, ${uses.length} referenced`);

  // 3. every nav target has a matching page section
  const pages = new Set(matches(/data-page="([^"]+)"/g));
  pages.forEach((page) => {
    if (!seen.has(`page-${page}`)) errors.push(`nav route "${page}" has no #page-${page} section`);
  });
  notes.push(`${pages.size} routes`);

  // 4. every local asset / stylesheet / script reference exists
  const refs = [...new Set(matches(/(?:src|href)="((?:assets|css|js)\/[^"]+)"/g))];
  refs.forEach((ref) => {
    if (!existsSync(resolve(root, ref))) errors.push(`missing local file "${ref}"`);
  });
  notes.push(`${refs.length} local asset references verified`);

  // 5. a page title and theme toggle must exist
  if (!html.includes('id="pageTitle"')) errors.push("missing #pageTitle");
  if (!html.includes('id="themeBtn"')) errors.push("missing #themeBtn (dark mode toggle)");

  return { errors, notes };
}

if (process.argv[1] && process.argv[1].endsWith("check-html.mjs")) {
  const { errors, notes } = checkHtml();
  notes.forEach((n) => console.log(`  · ${n}`));
  if (errors.length) {
    console.error("\n✖ HTML checks failed:");
    errors.forEach((e) => console.error(`  · ${e}`));
    process.exit(1);
  }
  console.log("\n✔ index.html structure OK");
}
