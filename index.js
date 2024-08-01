import { startCrossword } from "./puzzles.js";
import { across1 } from "./puzzleData.js";

async function main() {
  await startCrossword(across1);
}

main();

// const boof = [
//   ["", "b", "b"],
//   ["f", "b", "q"],
//   ["", "w", "x", "z", ""],
// ];
// for (const bol of boof) {
//   table.push(bol);
// }

// table.push(["", "b", "b"], ["f", "b", "q"], ["", "w", "x", "z", ""]);
// console.log(chalk.blueBright("Welcome to the game baby"));
// console.log(table.toString());
