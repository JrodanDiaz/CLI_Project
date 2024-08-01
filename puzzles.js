import CliTable3 from "cli-table3";
import { across1, symmetricalAcross } from "./puzzleData.js";
import inquirer from "inquirer";
import chalk from "chalk";
import boxen from "boxen";

let solved = false;

let rowStarters = [];
let columnStarters = [];
let AcrossHints = ["Across\n"];
let DownHints = ["Down\n"];

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
          rowStarters.push({ label: label, startingPos: i });
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
  let i = 0;
  for (const key in puzzle) {
    AcrossHints.push(`${rowStarters[i].label}. ${puzzle[key]}`);
    i += 1;
  }
  console.log(
    boxen(AcrossHints.join("\n"), {
      padding: 1,
      borderStyle: "round",
      textAlignment: "left",
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

const inputAnswer = async (label, direction) => {
  const answer = await inquirer.prompt({
    name: "answer",
    type: "input",
    message: "Input your answer.",
  });

  const startingPosition = rowStarters[label];
  if (direction === "across") {
    const row = table[startingPosition];
  }

  console.log(answer.answer);
};

const chooseAcrossOptions = async (table) => {
  const choices = [{ name: "<<< Go Back", value: "back" }];
  for (let i = 1; i < AcrossHints.length; i++) {
    choices.push({ name: AcrossHints[i], value: AcrossHints[i][0] });
  }

  const answers = await inquirer.prompt({
    name: "answer",
    type: "list",
    message: "Press 'Go Back' to go back to the previous menu",
    choices: choices,
  });
  if (answers.answer === "back") {
    await chooseAcrossOrDown();
  } else {
    await inputAnswer(answers.answer, "across");
  }
};

export const startCrossword = async (puzzle) => {
  displayEmptyPuzzle(puzzle);
  displayHints(puzzle);
  while (!solved) {
    await chooseAcrossOrDown();
  }
};
