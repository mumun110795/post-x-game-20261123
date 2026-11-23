// Hand-in program for the "agent builds a game from one prompt" entry.
//
// The whole job is to carry the repository's POST.json into the grading
// output directory, unchanged, byte for byte. The output root comes from
// MAKEFUN_OUTPUT_DIR and defaults to /output. That directory is only ever
// created, never deleted (on the grading runner it is a mounted volume);
// its contents are cleared so the hand-in is exactly one file.
//
// Before anything is touched, POST.json is read and checked: it has to
// exist, parse as JSON, and carry a string "url". If any of that fails the
// program says so on stderr and exits 1, leaving the output directory
// exactly as it was — a broken hand-in should fail loudly at the source,
// not hand the grader a missing or meaningless file.

import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const postPath = join(repoRoot, "POST.json");

// --- Validate POST.json before touching the output directory. ---

let raw: string;
try {
  raw = readFileSync(postPath, "utf8");
} catch (err) {
  console.error(`main.ts: cannot read POST.json (${(err as Error).message})`);
  process.exit(1);
}

let parsed: unknown;
try {
  parsed = JSON.parse(raw);
} catch (err) {
  console.error(`main.ts: POST.json is not valid JSON (${(err as Error).message})`);
  process.exit(1);
}

if (
  typeof parsed !== "object" ||
  parsed === null ||
  typeof (parsed as { url?: unknown }).url !== "string"
) {
  console.error('main.ts: POST.json has no string "url" field');
  process.exit(1);
}

// --- Hand in: create the output dir, clear its contents, copy the file. ---

mkdirSync(outDir, { recursive: true });
for (const entry of readdirSync(outDir)) {
  rmSync(join(outDir, entry), { recursive: true, force: true });
}

copyFileSync(postPath, join(outDir, "POST.json"));
console.log("handed in POST.json ->", join(outDir, "POST.json"));
