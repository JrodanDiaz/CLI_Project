import CliTable3 from "cli-table3";
import { puzzle1 } from "./puzzleData.js";
import inquirer from "inquirer";
import chalk from "chalk";
import boxen from "boxen";

/* 
 Input 4 -> Down or Across -> Display Hint, inquire input
 obtain input, across -> table at rowStarters where label = 4,
 validate input (length less than table[rowStarter pos].length)
 iterate through and add each char to an index of the row if != "-"

*/
// const puzzle = puzzle1;
let globalPuzzle;

const across = "across";
const down = "down";

let solved = false;

let rowStarters = [];
let columnStarters = [];
let AcrossHints = [];
let DownHints = [];

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
          columnStarters.push({ label: label, startingPos: p });
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
const displayEmptyPuzzle = (puzzle) => {
  const across = puzzle.across;

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
  const puzzle_across = puzzle.across;
  const puzzle_down = puzzle.down;
  console.log(puzzle_across);
  console.log(puzzle_down);
  if (AcrossHints.length === 0) {
    let i = 0;
    // the logic for this needs to change to account for down
    for (const key in puzzle_across) {
      AcrossHints.push(`${rowStarters[i].label}. ${puzzle_across[key]}`);
      i += 1;
    }
  }
  if (DownHints.length === 0) {
    let i = 0;
    for (const key in puzzle_down) {
      DownHints.push(`${columnStarters[i].label}. ${puzzle_down[key]}`);
      i += 1;
    }
  }
  console.log(
    // we dont need the first value, as it is the direction
    boxen(chalk.magenta(AcrossHints.join("\n")), {
      title: "Across",
      titleAlignment: "center",
      padding: 1,
      borderStyle: "round",
      textAlignment: "left",
    })
  );
  console.log(
    // we dont need the first value, as it is the direction
    boxen(chalk.magenta(DownHints.join("\n")), {
      title: "Down",
      titleAlignment: "center",
      padding: 1,
      borderStyle: "round",
      textAlignment: "left",
    })
  );
};

const chooseAcrossOrDown = async (puzzle) => {
  const answers = await inquirer.prompt({
    name: "direction",
    type: "list",
    message: `Choose answer input: Down or Across? \n`,
    choices: [
      { name: "Down", value: "down" },
      { name: "Across", value: "across" },
      { name: "Display Hints", value: "hints" },
    ],
  });
  if (answers.direction === "hints") {
    //this is just accessing the global puzzle variable. Clean this up later
    displayHints(puzzle);
    await chooseAcrossOrDown(puzzle);
  }
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

const getStartingColumnPosition = (label) => {
  for (const starter of columnStarters) {
    if (starter.label == label) {
      return starter.startingPos;
    }
  }
};

const getNumberFromChalkString = (string) => {
  const [first, second] = string.split(".");
  return first.at(-1);
};

const isChalkNumber = (string) => {
  return !isNaN(getNumberFromChalkString(string)) && string !== "";
  //   return !isNaN(chalkToNum[string]) && string !== "";
};

const modifyRow = async (answer, i) => {
  const row = table[i];
  let leftPointer = 0;

  for (let k = 0; i < table[i].length && leftPointer < answer.length; k++) {
    if (row[k] === "-") {
      continue;
    }
    // if (!isNaN(chalkToNum[row[k]]) && row[k] !== "") {
    if (isChalkNumber(row[k])) {
      console.log(`row[k] is a number: ${row[k]}`);
      row[k] = `${row[k].substring(0, 12)}${answer[leftPointer]}`;
      leftPointer++;
    } else {
      row[k] = answer[leftPointer];
      leftPointer++;
    }
  }
  table[i] = row;
};

const modifyColumn = (answer, column) => {};

const inputAnswerIsValid = async (answer, row) => {
  const validRow = row.filter((space) => space !== "-");
  if (answer.length > validRow.length) {
    console.log(
      `Error: Input was too long. Must be ${row.length} characters or less`
    );
    return false;
  }
  return true;
};

const downAnswerIsValid = (answer, column) => {
  let validColumnLength = 0;
  for (let i = 0; i < table.length; i++) {
    if (table[i][column] !== "-") {
      validColumnLength++;
    }
  }
  if (answer.length > validColumnLength) {
    console.log(
      `Error: Input was too long. Must be ${validColumnLength.length} characters or less`
    );
    return false;
  }
  return true;
};

const inputAnswer = async (label, direction) => {
  //iterate through AcrossHints: String[] to find the hint that matches the label
  //maybe instead we should have a bucket array where the index is the label and the value is the hint

  const hint =
    direction === across
      ? AcrossHints.filter((hint) => hint[0] == label)
      : DownHints.filter((hint) => hint[0] == label);
  const answer = await inquirer.prompt({
    name: "answer",
    type: "input",
    message: `${hint[0]}\nInput your answer:`,
  });

  if (direction === across) {
    const startingRow = getStartingRowPosition(label);
    if (!(await inputAnswerIsValid(answer.answer, table[startingRow]))) {
      await inputAnswer(label, direction);
    } else {
      await modifyRow(answer.answer.toUpperCase(), startingRow);
      const row = table[startingRow];
      console.log(row);
      console.log("=========");
      console.log(table.toString());
      checkCrossword();
    }
  } else {
    const startingColumn = getStartingColumnPosition(label);
    if (!(await downAnswerIsValid(answer.answer, startingColumn))) {
      await inputAnswer(label, direction);
    } else {
      await modifyColumn(answer.answer.toUpperCase(), startingColumn);
    }
  }
};

const isEmptyChalkString = (string) => {
  return string.length === 18;
};

const isPopulatedChalkString = (string) => {
  return string.length === 19;
};

const getValueFromChalkString = (string) => {
  return string.at(-1);
};
// \x1B[34m1.\x1B[39m
// this is an empty chalk string (length 18)
const checkCrossword = () => {
  const answerSet = new Set();
  for (const key of [
    ...Object.keys(globalPuzzle.across),
    ...Object.keys(globalPuzzle.down),
  ]) {
    let formattedKey = key.trim().toUpperCase();
    answerSet.add(formattedKey);
  }
  for (const row of table) {
    let acrossWord = "";
    for (let value of row) {
      if (isPopulatedChalkString(value)) {
        value = getValueFromChalkString(value);
      }
      const lastValue = value.at(-1);
      if (lastValue !== "-") {
        acrossWord += lastValue;
      }
    }
    if (!answerSet.has(acrossWord)) {
      console.log(answerSet);
      console.log(`answerSet does not have ${acrossWord}`);
      return false;
    }
    console.log(`${acrossWord} found in set :-)`);
  }
  console.log("all words match");
  console.log(answerSet);
  return true;
};

export const startCrossword = async (puzzle) => {
  globalPuzzle = puzzle;
  displayEmptyPuzzle(puzzle);
  displayHints(puzzle);
  while (!solved) {
    await chooseAcrossOrDown(puzzle);
  }
};
