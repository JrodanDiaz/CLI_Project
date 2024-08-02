import { startCrossword } from "./puzzles.js";
import { puzzle1, puzzle2, puzzle3 } from "./puzzleData.js";

async function main() {
  await startCrossword(puzzle3);
}

main();
