import CliTable3 from "cli-table3";
import { across1, symmetricalAcross } from "./puzzleData.js";
import inquirer from "inquirer";
import chalk from "chalk";
import boxen from "boxen";

/* 
 Input 4 -> Down or Across -> Display Hint, inquire input
 obtain input, across -> table at rowStarters where label = 4,
 validate input (length less than table[rowStarter pos].length)
 iterate through and add each char to an index of the row if != "-"

*/

const across = "across";
const down = "down";

let solved = false;

let rowStarters = [];
let columnStarters = [];
let AcrossHints = ["Across\n"];
let DownHints = ["Down\n"];
const chalkToNum = {};
for (let i = 0; i < 15; i++) {
  const num = chalk.blue(`${i}.`);
  chalkToNum[num] = i;
}

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
  wordWrap: true,
  colWidths: [5, 5, 5, 5, 5],
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
        table[i][p] = `${chalk.blue(`${label}.`)}`;
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
  // only update acrossHints the first time this function is called
  if (AcrossHints.length === 1) {
    let i = 0;
    // the logic for this needs to change to account for down
    for (const key in puzzle) {
      AcrossHints.push(`${rowStarters[i].label}. ${puzzle[key]}`);
      i += 1;
    }
  }
  console.log(
    // we dont need the first value, as it is the direction
    boxen(AcrossHints.slice(1).join("\n"), {
      title: "Across",
      titleAlignment: "center",
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
  await chooseNumber(answers.direction);
};

const chooseNumber = async (direction) => {
  const answer = await inquirer.prompt({
    name: "number",
    type: "input",
    message: "Which hint would you like to try? (Input number)",
  });
  console.log(`you chose hint #${answer.number}`);
  await inputAnswer(answer.number, direction);
};

const getStartingRowPosition = (label) => {
  for (const starter of rowStarters) {
    if (starter.label == label) {
      return starter.startingPos;
    }
  }
};

const modifyRow = async (answer, i) => {
  const row = table[i];
  let leftPointer = 0;
  if (answer.length > row.length) {
    console.log(
      `Error: Input was too long. Must be ${row.length} characters or less`
    );
    // in the future, we may want to just go right back to asking to input the answer
    await chooseNumber(across);
  }
  for (let k = 0; i < table[i].length && leftPointer < answer.length; k++) {
    if (row[k] === "-") {
      continue;
    }
    if (!isNaN(chalkToNum[row[k]]) && row[k] !== "") {
      console.log(`row[k] is a number: ${row[k]}`);
      row[k] = `${row[k]}${answer[leftPointer]}`;
      leftPointer++;
    } else {
      row[k] = answer[leftPointer];
      leftPointer++;
    }
  }
  table[i] = row;
};

const inputAnswer = async (label, direction) => {
  //iterate through AcrossHints: String[] to find the hint that matches the label
  //maybe instead we should have a bucket array where the index is the label and the value is the hint
  const hint = AcrossHints.filter((hint) => hint[0] == label);
  const answer = await inquirer.prompt({
    name: "answer",
    type: "input",
    message: `${hint[0]}\nInput your answer:`,
  });

  if (direction === across) {
    const startingRow = getStartingRowPosition(label);
    await modifyRow(answer.answer, startingRow);
    const row = table[startingRow];
    console.log(row);
    console.log("=========");
    console.log(table.toString());
  }

  console.log(answer.answer);
};

// const chooseAcrossOptions = async (table) => {
//   const choices = [{ name: "<<< Go Back", value: "back" }];
//   for (let i = 1; i < AcrossHints.length; i++) {
//     choices.push({ name: AcrossHints[i], value: AcrossHints[i][0] });
//   }

//   const answers = await inquirer.prompt({
//     name: "answer",
//     type: "list",
//     message: "Press 'Go Back' to go back to the previous menu",
//     choices: choices,
//   });
//   if (answers.answer === "back") {
//     await chooseAcrossOrDown();
//   } else {
//     await inputAnswer(answers.answer, "across");
//   }
// };

export const startCrossword = async (puzzle) => {
  displayEmptyPuzzle(puzzle);
  displayHints(puzzle);
  while (!solved) {
    await chooseAcrossOrDown();
  }
};
