import { startCrossword } from "./puzzles.js";
import CliTable3 from "cli-table3";
import { puzzle1 } from "./puzzleData.js";

async function main() {
  await startCrossword(puzzle1);
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

// let table = new CliTable3({
//   chars: {
//     top: "═",
//     "top-mid": "╤",
//     "top-left": "╔",
//     "top-right": "╗",
//     bottom: "═",
//     "bottom-mid": "╧",
//     "bottom-left": "╚",
//     "bottom-right": "╝",
//     left: "║",
//     "left-mid": "╟",
//     mid: "─",
//     "mid-mid": "┼",
//     right: "║",
//     "right-mid": "╢",
//     middle: "│",
//   },
// });

// table.push(["", "b", "b"], ["f", "b", "q"], ["", "w", "x", "z", ""]);
// console.log(table[0]);
// console.log(table.toString());
