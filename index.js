import { startCrossword } from "./puzzles.js";
import { puzzle1, puzzle2, puzzle3 } from "./puzzleData.js";

async function main() {
  await startCrossword([puzzle1, puzzle2, puzzle3]);
}

main();
