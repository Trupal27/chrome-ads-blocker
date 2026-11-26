// Generates src/rules/ads.json from filters/network.txt.
//   node scripts/build-rules.mjs          write the ruleset
//   node scripts/build-rules.mjs --check  fail if ads.json is out of date (CI)
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "filters/network.txt");
const OUT = join(root, "src/rules/ads.json");

// Chrome guarantees every extension at least this many enabled static rules.
const MAX_STATIC_RULES = 30000;

const RESOURCE_TYPES = [
  "script", "image", "sub_frame", "xmlhttprequest", "media",
  "ping", "other", "stylesheet", "object", "websocket",
];

export function buildRules(text) {
  const seen = new Set();
  const errors = [];
  const filters = [];
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line || line.startsWith("#")) return;
    if (/\s/.test(line)) errors.push(`line ${i + 1}: filters cannot contain spaces: "${line}"`);
    else if (!/^[\x21-\x7e]+$/.test(line)) errors.push(`line ${i + 1}: filters must be ASCII: "${line}"`);
    else if (seen.has(line)) errors.push(`line ${i + 1}: duplicate filter "${line}"`);
    else { seen.add(line); filters.push(line); }
  });
  if (filters.length > MAX_STATIC_RULES) {
    errors.push(`${filters.length} rules exceeds the ${MAX_STATIC_RULES} static rule limit`);
  }
  const rules = filters.map((urlFilter, i) => ({
    id: i + 1,
    priority: 1,
    action: { type: "block" },
    condition: { urlFilter, resourceTypes: RESOURCE_TYPES },
  }));
  return { rules, errors };
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const { rules, errors } = buildRules(readFileSync(SRC, "utf8"));
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exit(1);
  }
  const json = JSON.stringify(rules, null, 1) + "\n";
  if (process.argv.includes("--check")) {
    if (readFileSync(OUT, "utf8") !== json) {
      console.error("src/rules/ads.json is out of date. Run: npm run build:rules");
      process.exit(1);
    }
    console.log(`rules OK (${rules.length})`);
  } else {
    writeFileSync(OUT, json);
    console.log(`wrote ${rules.length} rules to src/rules/ads.json`);
  }
}
