import CliTable3 from "cli-table3";
import inquirer from "inquirer";
import chalk from "chalk";
import boxen from "boxen";
import {
  getStartingRowPosition,
  getStartingColumnPosition,
  isChalkNumber,
  acrossAnswerIsValid,
  downAnswerIsValid,
  isPopulatedChalkString,
  getValueFromChalkString,
  printFiglet,
} from "./puzzleUtils.js";

let globalPuzzle;
let table;
let answerSet;

const across = "across";
const down = "down";

let solved = false;

//array of objects {label: number, startingPosition: number}
//this array allows us to know exactly where to start modifying the table when a word is inputted
let rowStarters = [];
let columnStarters = [];

// these arrays store the hints, which are appended to their dynamically generated numbered label
let AcrossHints = [];
let DownHints = [];

const initializeTable = (puzzle) => {
  const newTable = new CliTable3({
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
    colWidths: new Array(Object.values(puzzle.down).length).fill(5),
  });
  table = newTable;
};

const initializeAnswerSet = (puzzle) => {
  const set = new Set();
  for (const key of [
    ...Object.keys(puzzle.across),
    ...Object.keys(puzzle.down),
  ]) {
    let formattedKey = key.trim().toUpperCase();
    set.add(formattedKey);
  }
  answerSet = set;
};

const labelRowsAndColumns = (table) => {
  const labeled = new Set();
  let label = 1;
  for (let row = 0; row < table.length; row++) {
    for (let col = 0; col < table[row].length; col++) {
      //if the current table column has been labeled already, skip it
      if (labeled.has(col)) {
        continue;
      }
      //otherwise, if the table is open, label it
      if (table[row][col] === "") {
        table[row][col] = `${chalk.blue(`${label}.`)}`;
        // if the label is a left boundary of the table, save its position to row starters (it starts the row and is an across word)
        if (col - 1 < 0 || table[row][col - 1] === "---") {
          rowStarters.push({ label: label, startingPos: row });
        }
        // if the label is a top boundary of the table, save its position to column starters (it starts the column and is a down word)
        if (row - 1 < 0 || table[row - 1][col] === "---") {
          columnStarters.push({ label: label, startingPos: col });
        }
        //increment label, and ensure we never add 0 to the set, as the zero index of every row always starts a row
        label += 1;
        if (col !== 0) {
          labeled.add(col);
        }
      }
    }
  }
  return table;
};

const createEmptyPuzzle = (puzzle) => {
  //the keys of the across object are special
  //the keys are strings, and any spaces will block out the table cell, filling it with a ---
  const across = puzzle.across;

  const rows = [];
  for (const answer in across) {
    const row = [];
    for (const char in answer) {
      //if the key has a blank space, block the cell out
      if (answer[char] === " ") {
        row.push("---");
        //else if the key is a normal character, create a usuable empty cell
      } else {
        row.push("");
      }
    }
    //push this row to the rows array
    rows.push(row);
  }
  //push all the rows to the table
  const labeledTable = labelRowsAndColumns(rows);
  table.push(...labeledTable);
};

const initializeLabeledHints = (puzzle, rowStarters, columnStarters) => {
  //when this function is called, the table has been created and labeled
  //we have saved which labels start rows, which labels start columns, and which labels do both
  //we now can append the hints to their corresponding labels and save it to the acrossHints and downHints array
  const acrossHints = [];
  const downHints = [];
  const puzzle_across = puzzle.across;
  const puzzle_down = puzzle.down;

  let i = 0;
  for (const key in puzzle_across) {
    acrossHints.push(`${rowStarters[i].label}. ${puzzle_across[key]}`);
    i += 1;
  }

  i = 0;
  for (const key in puzzle_down) {
    downHints.push(`${columnStarters[i].label}. ${puzzle_down[key]}`);
    i += 1;
  }
  return [acrossHints, downHints];
};

const displayHints = () => {
  console.log(table.toString());
  console.log(
    // we dont need the first value, as it is the direction
    boxen(chalk.cyan(AcrossHints.join("\n")), {
      title: "Across",
      titleAlignment: "center",
      padding: 1,
      borderStyle: "round",
      textAlignment: "left",
      borderColor: "cyan",
    })
  );
  console.log(
    // we dont need the first value, as it is the direction
    boxen(chalk.red(DownHints.join("\n")), {
      title: "Down",
      titleAlignment: "center",
      padding: 1,
      borderStyle: "round",
      textAlignment: "left",
      borderColor: "red",
    })
  );
};

const chooseOptionsMenu = async (puzzle) => {
  const answers = await inquirer.prompt({
    name: "direction",
    type: "list",
    message: `Choose any option. \n`,
    choices: [
      { name: chalk.cyan("Across"), value: "across" },
      { name: chalk.red("Down"), value: "down" },
      { name: chalk.yellow("Display Hints"), value: "hints" },
      { name: chalk.green("Check Puzzle"), value: "check" },
      { name: chalk.magenta("Exit"), value: "exit" },
    ],
  });

  if (answers.direction === "hints") {
    displayHints();
    await chooseOptionsMenu(puzzle);
  } else if (answers.direction === "check") {
    const isSolved = checkCrossword();
    if (!isSolved) {
      await printFiglet("Not done yet", "slant");
      console.log(chalk.red("The crossword is incorrect or incomplete"));
    } else {
      await printFiglet("Hooray!", "slant");
      console.log();
      solved = true;
    }
  } else if (answers.direction === "exit") {
    solved = true;
  } else {
    await chooseNumber(answers.direction);
  }
};

const isValidNumber = (number) => {
  return !isNaN(number) && number !== "";
};

const chooseNumber = async (direction) => {
  const answer = await inquirer.prompt({
    name: "number",
    type: "input",
    message: "Which hint would you like to try? (Input number)",
  });
  if (await isValidNumber(answer.number)) {
    console.log(chalk.green(`You chose ${direction} hint #${answer.number}`));
    await inputAnswer(answer.number, direction);
  } else {
    console.log(chalk.red("Please input a valid number"));
    await chooseNumber(direction);
  }
};

const modifyRow = async (answer, i) => {
  const row = table[i];
  let leftPointer = 0;

  for (let k = 0; i < table[i].length && leftPointer < answer.length; k++) {
    if (row[k] === "---") {
      continue;
    }
    //the numbers are colored blue with chalk, which convert it to a long weird string, so special handling is required
    if (isChalkNumber(row[k])) {
      //this substring cuts out the very last character of the chalk string (our previous input)
      row[k] = `${row[k].substring(0, 12)}${answer[leftPointer]}`;
      leftPointer++;
      //otherwise, set the cell to the character with 2 empty spaces before it, so that it's aligned with the numbered cells
    } else {
      row[k] = `  ${answer[leftPointer]}`;
      leftPointer++;
    }
  }
  table[i] = row;
};

const modifyColumn = (answer, column) => {
  let leftPointer = 0;
  for (const row of table) {
    if (leftPointer > answer.length) {
      break;
    }
    //if the cell is invalid, continue
    if (row[column] === "---") {
      continue;
    }
    //handle the special chalk number case
    if (isChalkNumber(row[column])) {
      row[column] = `${row[column].substring(0, 12)}${answer[leftPointer]}`;
      leftPointer++;
      //if cell is empty or cell is just one char long, replace it
    } else {
      row[column] = `  ${answer[leftPointer]}`;
      leftPointer++;
    }
  }
};

const inputAnswer = async (label, direction) => {
  const hint =
    direction === across
      ? AcrossHints.filter((hint) => hint[0] == label)
      : DownHints.filter((hint) => hint[0] == label);

  const answer = await inquirer.prompt({
    name: "answer",
    type: "input",
    message: `${chalk.yellow(hint[0])}\nInput your answer:`,
  });

  if (direction === across) {
    const startingRow = getStartingRowPosition(label, rowStarters);
    // if the inputted answer is invalid, ask again
    if (!(await acrossAnswerIsValid(answer.answer, table[startingRow]))) {
      await inputAnswer(label, direction);
      //otherwise, modify the row
    } else {
      await modifyRow(answer.answer.toUpperCase(), startingRow);
    }
  } else {
    const startingColumn = getStartingColumnPosition(label, columnStarters);
    // if the inputted answer is invalid, ask again
    if (!(await downAnswerIsValid(answer.answer, table, startingColumn))) {
      await inputAnswer(label, direction);
      //otherwise. modify the column
    } else {
      await modifyColumn(answer.answer.toUpperCase(), startingColumn);
    }
  }
  displayHints();
};

const checkCrossword = () => {
  //we only need to check if all across words are correct, b/c if they are, then the down words are correct too
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
    //if any across word is not found in the answer set, return false
    if (!answerSet.has(acrossWord)) {
      return false;
    }
  }
  return true;
};

const choosePuzzle = async (puzzles) => {
  const choices = [];
  for (let i = 0; i < puzzles.length; i++) {
    choices.push({ name: chalk.cyan(`Puzzle ${i + 1}`), value: `${i}` });
  }
  const answer = await inquirer.prompt({
    name: "puzzle",
    type: "list",
    message: chalk.magenta(`Choose the puzzle you'd like to play`),
    choices: choices,
  });

  return puzzles[answer.puzzle];
};

export const startCrossword = async (puzzles) => {
  const puzzle = await choosePuzzle(puzzles);
  globalPuzzle = puzzle;
  initializeTable(puzzle);
  initializeAnswerSet(puzzle);
  createEmptyPuzzle(puzzle);
  const [acrossHints, downHints] = initializeLabeledHints(
    puzzle,
    rowStarters,
    columnStarters
  );
  AcrossHints = acrossHints;
  DownHints = downHints;
  await printFiglet("Terminal Crossword Time", "slant");
  displayHints();
  while (!solved) {
    await chooseOptionsMenu(puzzle);
  }
};
