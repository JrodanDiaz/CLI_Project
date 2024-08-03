import { puzzle1, puzzle2, puzzle3, puzzle4 } from "./puzzleData.js";
import Crossword from "./puzzles copy.js";

// async function main() {
//   await startCrossword([puzzle1, puzzle2, puzzle3]);
async function main() {
  const crossword = new Crossword();
  crossword.addPuzzles([puzzle1, puzzle2, puzzle3, puzzle4]);
  await crossword.startCrossword();
}

main();
