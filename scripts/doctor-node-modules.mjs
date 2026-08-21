#!/usr/bin/env node
/**
 * Guards against pnpm's silent "hollow package" failure on Windows.
 *
 * How the breakage happens: if `pnpm install` / `pnpm add` runs while a node
 * process still holds the project's modules open (a live `next dev`, a payload
 * script), Windows refuses to unlink the loaded files. pnpm's virtual-store
 * prune deletes what it can and leaves
 * `node_modules/.pnpm/<id>/node_modules/<pkg>/` behind as an EMPTY directory.
 *
 * Why it never heals on its own: pnpm treats "that directory exists" as "the
 * package is installed", so every later `pnpm install` reports *Already up to
 * date* and re-links nothing. The dev server then dies with
 * `Can't resolve 'sharp'` / `Cannot find package 'pino'` until the empty
 * directories are removed by hand.
 *
 * So: scan the virtual store, delete any package directory with no
 * package.json, and let pnpm re-link them. Runs before dev/build (predev,
 * prebuild). Costs ~0.2s when nothing is wrong.
 */
import { readdirSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const VIRTUAL_STORE = join(process.cwd(), "node_modules", ".pnpm");

/** Every real package directory inside the virtual store, scoped ones included. */
function packageDirs() {
  if (!existsSync(VIRTUAL_STORE)) return [];
  const dirs = [];
  for (const entry of readdirSync(VIRTUAL_STORE, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === "node_modules") continue;
    const inner = join(VIRTUAL_STORE, entry.name, "node_modules");
    if (!existsSync(inner)) continue;
    for (const pkg of readdirSync(inner, { withFileTypes: true })) {
      // Symlinks here point at a package's own deps — the real copy lives in
      // that dependency's own virtual-store entry, so following them would
      // double-report.
      if (!pkg.isDirectory()) continue;
      if (pkg.name.startsWith("@")) {
        const scopeDir = join(inner, pkg.name);
        for (const scoped of readdirSync(scopeDir, { withFileTypes: true })) {
          if (scoped.isDirectory()) dirs.push(join(scopeDir, scoped.name));
        }
      } else {
        dirs.push(join(inner, pkg.name));
      }
    }
  }
  return dirs;
}

const hollow = packageDirs().filter((d) => !existsSync(join(d, "package.json")));

if (hollow.length === 0) {
  if (process.argv.includes("--verbose")) console.log("node_modules OK");
  process.exit(0);
}

console.warn(
  `\n[doctor] ${hollow.length} hollow package folder(s) in the pnpm virtual store — ` +
    `an install ran while the app had these files open. Repairing:\n` +
    hollow.map((d) => `  - ${d.replace(process.cwd() + "\\", "")}`).join("\n"),
);

if (!process.argv.includes("--fix")) {
  console.warn("\n[doctor] Re-run with --fix (or `pnpm doctor:modules`) to repair.\n");
  process.exit(1);
}

for (const dir of hollow) rmSync(dir, { recursive: true, force: true });

const pnpmBin = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const install = spawnSync(pnpmBin, ["install", "--prefer-offline"], {
  stdio: "inherit",
});
if (install.status !== 0) process.exit(install.status ?? 1);

const stillHollow = packageDirs().filter((d) => !existsSync(join(d, "package.json")));
if (stillHollow.length > 0) {
  console.error(
    "\n[doctor] Repair failed — files are still locked. Close every running " +
      "`next dev` / node process for this project and run `pnpm doctor:modules` again.\n",
  );
  process.exit(1);
}
console.warn("[doctor] Repaired. Continuing.\n");
