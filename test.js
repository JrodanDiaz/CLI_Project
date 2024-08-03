import { puzzle1, puzzle2, puzzle3, puzzle4 } from "./puzzleData.js";
import Crossword from "./puzzleClass.js";

async function main() {
  const crossword = new Crossword();
  crossword.addPuzzles([puzzle1, puzzle2, puzzle3, puzzle4]);
  await crossword.startCrossword();
}

main();
