// gta6-meme-x-01 entry program (Node 22, standard library only).
//
// The entry is the X post itself: an AI-made GTA 6 meme (a WANTED poster for
// Rockstar Games on a Vice City street, make.fun's ghost mascot standing in
// the scene), posted from a public X account with make.fun and the entrant's
// play code in its text. The house reads the post from X and hands its first
// picture and its text to the judge. Nothing this program writes is judged.
//
// All this program does is hand POST.json — the post's address — to the
// grader: it reads POST.json from the repository root and writes it, byte for
// byte, to <output>/POST.json. It uses no network, no wall clock and no files
// outside the repository, so repeated runs write identical bytes.
//
// Local run (the grader runs the same with /bot and /output):
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const repoDir = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

const sourcePath = join(repoDir, "POST.json");
const destPath = join(outDir, "POST.json");

let postBytes;
try {
  postBytes = readFileSync(sourcePath);
} catch (err) {
  console.error(`cannot read ${sourcePath}: ${(err as Error).message}`);
  process.exit(1);
}

let parsed;
try {
  parsed = JSON.parse(postBytes.toString("utf8"));
} catch (err) {
  console.error(`POST.json is not valid JSON: ${(err as Error).message}`);
  process.exit(1);
}

if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
  console.error("POST.json must be a JSON object with a url field");
  process.exit(1);
}

try {
  mkdirSync(outDir, { recursive: true });
  writeFileSync(destPath, postBytes);
} catch (err) {
  console.error(`cannot write ${destPath}: ${(err as Error).message}`);
  process.exit(1);
}
