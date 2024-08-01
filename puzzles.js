import CliTable3 from "cli-table3";
import { across1, symmetricalAcross } from "./puzzleData.js";
import inquirer from "inquirer";
import chalk from "chalk";
import boxen from "boxen";

let solved = false;

let rowStarters = [];
let columnStarters = [];

let table = new CliTable3({
  chars: {
    top: "═",
    "top-mid": "╤",
    "top-left": "╔",
    "top-right": "╗",
    bottom: "═",
    "bottom-mid": "╧",
    "bottom-left": "╚",
    "bottom-right": "╝",
    left: "║",
    "left-mid": "╟",
    mid: "─",
    "mid-mid": "┼",
    right: "║",
    "right-mid": "╢",
    middle: "│",
  },
});

//we need to run a check that the words intersect correctly
//maybe add functionality that allows for offsets
//maybe we should only take the across ones and label it accordingly

const displayCompletedPuzzle = (across) => {
  //   puzzles.append({ down, across });
  const rows = [];
  for (const answer in across) {
    const row = [];
    for (const i in answer) {
      row.push(answer[i]);
    }
    rows.push(row);
  }
  table.push(...rows);
};

const labelRowsAndColumns = (table) => {
  const labeled = new Set();
  let label = 1;
  for (let i = 0; i < table.length; i++) {
    for (let p = 0; p < table[i].length; p++) {
      if (labeled.has(p)) {
        continue;
      }
      if (table[i][p] === "") {
        table[i][p] = `${label}`;
        if (p - 1 < 0 || table[i][p - 1] === "-") {
          rowStarters.push(label);
        }
        if (i - 1 < 0 || table[i - 1][p] === "-") {
          columnStarters.push(label);
        }
        label += 1;
        if (p !== 0) {
          labeled.add(p);
        }
      }
    }
  }
  console.log(`rowStarters: ${rowStarters}`);
  console.log(`colStarters: ${columnStarters}`);
  return table;
};

//we should have a global variable for column numbers and row numbers
const displayEmptyPuzzle = (across) => {
  const rows = [];
  for (const answer in across) {
    const row = [];
    for (const i in answer) {
      if (answer[i] === " ") {
        row.push("-");
      } else {
        row.push("");
      }
    }
    rows.push(row);
  }
  const labeledTable = labelRowsAndColumns(rows);
  table.push(...labeledTable);
  console.log(table.toString());
};

const displayHints = (puzzle) => {
  let Across = "Across\n\n";
  let Down = "";
  let i = 1;
  for (const key in puzzle) {
    Across += `${i}. ${puzzle[key]}\n`;
    i += 1;
  }
  console.log(
    boxen(Across, {
      // padding: 1,
      borderStyle: "round",
      textAlignment: "center",
    })
  );
};

const chooseAcrossOrDown = async () => {
  const answers = await inquirer.prompt({
    name: "direction",
    type: "list",
    message: `Choose answer input: Down or Across? \n`,
    choices: [
      { name: "Down", value: "down" },
      { name: "Across", value: "across" },
    ],
  });
  let direction = answers.direction;
  if (direction === "across") {
    await chooseAcrossOptions();
  }
};

const chooseAcrossOptions = async (table) => {
  const choices = [{ name: "<<< Go Back", value: "back" }];
  for (const row of table) {
    for (const col of row) {
    }
  }

  const answers = await inquirer.prompt({
    name: "answer",
    type: "list",
    message: "Press 'Go Back' to go back to the previous menu",
    choices: choices,
  });
  if (answers.answer === "back") {
    await chooseAcrossOrDown();
  }
};

export const startCrossword = async (puzzle) => {
  displayHints(puzzle);
  displayEmptyPuzzle(puzzle);
  while (!solved) {
    await chooseAcrossOrDown();
  }
};

// displayCompletedPuzzle(across1);
// displayEmptyPuzzle(across1);
// displayHints(across1);
// displayEmptyPuzzle(symmetricalAcross);
// displayHints(symmetricalAcross);
// displayCompletedPuzzle(symmetricalAcross);
// console.log(table.toString());
