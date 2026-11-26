// Validates the extension and packages it as a zip for GitHub releases.
//   node scripts/build.mjs           validate + create dist/chrome-ads-blocker-<version>.zip
//   node scripts/build.mjs --check   validate only (used by CI)
import { readFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "src");
const errors = [];
const fail = (msg) => errors.push(msg);

// 1. Rules are generated from filters/network.txt and up to date.
execFileSync(process.execPath, [join(root, "scripts/build-rules.mjs"), "--check"], { stdio: "inherit" });

// 2. Manifest sanity.
const manifest = JSON.parse(readFileSync(join(src, "manifest.json"), "utf8"));
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
if (manifest.manifest_version !== 3) fail("manifest_version must be 3");
if (!/^\d+(\.\d+){0,3}$/.test(manifest.version)) fail(`invalid version "${manifest.version}"`);
if (manifest.version !== pkg.version) {
  fail(`manifest version ${manifest.version} != package.json version ${pkg.version}`);
}
if (manifest.name.length > 75) fail("name must be at most 75 characters");
if (manifest.description.length > 132) fail("description must be at most 132 characters");

// 3. Every file the manifest references exists.
const refs = [
  ...Object.values(manifest.icons ?? {}),
  ...Object.values(manifest.action?.default_icon ?? {}),
  manifest.action?.default_popup,
  manifest.background?.service_worker,
  ...(manifest.declarative_net_request?.rule_resources ?? []).map((r) => r.path),
  ...(manifest.content_scripts ?? []).flatMap((c) => [...(c.js ?? []), ...(c.css ?? [])]),
].filter(Boolean);
for (const f of refs) if (!existsSync(join(src, f))) fail(`missing file referenced by manifest: ${f}`);

// 4. Ruleset IDs are unique.
for (const res of manifest.declarative_net_request?.rule_resources ?? []) {
  const rules = JSON.parse(readFileSync(join(src, res.path), "utf8"));
  const ids = new Set();
  for (const r of rules) {
    if (ids.has(r.id)) fail(`${res.path}: duplicate rule id ${r.id}`);
    ids.add(r.id);
  }
}

// 5. JavaScript parses.
for (const f of refs.filter((f) => f.endsWith(".js")).concat("popup/popup.js")) {
  try {
    execFileSync(process.execPath, ["--check", join(src, f)], { stdio: "pipe" });
  } catch (e) {
    fail(`syntax error in ${f}:\n${e.stderr}`);
  }
}

if (errors.length) {
  console.error("Build failed:\n- " + errors.join("\n- "));
  process.exit(1);
}
console.log(`manifest OK (v${manifest.version})`);

if (!process.argv.includes("--check")) {
  const dist = join(root, "dist");
  mkdirSync(dist, { recursive: true });
  const out = join(dist, `chrome-ads-blocker-${manifest.version}.zip`);
  rmSync(out, { force: true });
  execFileSync("zip", ["-r", "-X", "-q", out, ".", "-x", "*.DS_Store"], { cwd: src, stdio: "inherit" });
  console.log(`packaged ${out}`);
}
