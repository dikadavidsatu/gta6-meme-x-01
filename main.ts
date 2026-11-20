// gta6-meme-x-01 entry program (Node 22, standard library only).
//
// The entry is the X post itself: an AI-made GTA 6 meme (a WANTED poster for
// Rockstar Games on a Vice City street, make.fun's ghost mascot standing in
// the scene), posted from a public X account with make.fun and the entrant's
// play code in its text. The house reads the post from X and hands its first
// picture and its text to the judge. Nothing this program writes is judged.
//
// This program hands POST.json — the post's address — to the grader. Before
// copying anything it validates the file properly: POST.json must parse as a
// JSON object whose "url" field is a canonical X status URL of the form
// https://x.com/<handle>/status/<digits>. A malformed file fails loudly with
// a specific message instead of handing the grader a bad address. On success
// it writes POST.json, byte for byte, to <output>/POST.json. It uses no
// network, no wall clock and no files outside the repository, so repeated
// runs write identical bytes.
//
// Local run (the grader runs the same with /bot and /output):
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const repoDir = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

const sourcePath = join(repoDir, "POST.json");
const destPath = join(outDir, "POST.json");

// Canonical X status URL: https://x.com/<handle>/status/<numeric id>.
// Handles are 1–15 chars of letters, digits and underscores.
const X_STATUS_URL = /^https:\/\/x\.com\/[A-Za-z0-9_]{1,15}\/status\/[0-9]+$/;

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

let postBytes;
try {
  postBytes = readFileSync(sourcePath);
} catch (err) {
  fail(`cannot read ${sourcePath}: ${(err as Error).message}`);
}

let parsed;
try {
  parsed = JSON.parse(postBytes.toString("utf8"));
} catch (err) {
  fail(`POST.json is not valid JSON: ${(err as Error).message}`);
}

if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
  fail("POST.json must be a JSON object with a url field");
}

const url = (parsed as { url?: unknown }).url;
if (typeof url !== "string" || url.length === 0) {
  fail('POST.json must carry a non-empty string "url" field');
}
if (!X_STATUS_URL.test(url)) {
  fail(
    `POST.json url is not a canonical X status URL ` +
      `(want https://x.com/<handle>/status/<digits>): ${url}`,
  );
}

try {
  mkdirSync(outDir, { recursive: true });
  writeFileSync(destPath, postBytes);
} catch (err) {
  fail(`cannot write ${destPath}: ${(err as Error).message}`);
}

// Also leave a small manifest next to POST.json so a human (or a later
// tool) can see at a glance which post was handed over and which meme file
// belongs to it, without having to open the post file itself. The meme name
// is only recorded when the file is actually present in the repository.
const memeName = "meme.png";
const summary = {
  url,
  meme: existsSync(join(repoDir, memeName)) ? memeName : null,
  post_file: "POST.json",
};
const summaryPath = join(outDir, "summary.json");
try {
  writeFileSync(summaryPath, JSON.stringify(summary, null, 2) + "\n");
} catch (err) {
  fail(`cannot write ${summaryPath}: ${(err as Error).message}`);
}
