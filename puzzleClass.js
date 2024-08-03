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

class Crossword {
  #puzzles = [];
  #globalPuzzle = null;
  #table = null;
  #answerSet = null;
  #across = "across";
  #rowStarters = [];
  #columnStarters = [];
  #AcrossHints = [];
  #DownHints = [];
  #solved = false;

  // Public methods
  addPuzzle(puzzle) {
    this.#puzzles.push(puzzle);
  }

  addPuzzles(puzzles) {
    this.#puzzles.push(...puzzles);
  }

  getPuzzles() {
    return this.#puzzles;
  }

  removePuzzle(index) {
    if (index >= 0 && index < this.#puzzles.length) {
      this.#puzzles.splice(index, 1);
    }
  }

  clearPuzzles() {
    this.#puzzles = [];
  }
  #initializeTable() {
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
      colWidths: new Array(Object.values(this.#globalPuzzle.down).length).fill(
        5
      ),
    });
    console.log(newTable.toString());

    this.#table = newTable;
  }

  #initializeAnswerSet() {
    const set = new Set();
    for (const key of [
      ...Object.keys(this.#globalPuzzle.across),
      ...Object.keys(this.#globalPuzzle.down),
    ]) {
      let formattedKey = key.trim().toUpperCase();
      set.add(formattedKey);
    }
    this.#answerSet = set;
  }

  #isLeftBoundary(row, col, table) {
    return col - 1 < 0 || table[row][col - 1] === "---";
  }

  #isTopBoundary(row, col, table) {
    return row - 1 < 0 || table[row - 1][col] === "---";
  }

  #labelRowsAndColumns(table) {
    const labeled = new Set();
    let label = 1;
    for (let row = 0; row < table.length; row++) {
      let containsLabel = false;
      for (let col = 0; col < table[row].length; col++) {
        //otherwise, if the table is open, label it
        if (table[row][col] === "") {
          // in cases where a left offset occurs in the middle of the crossword, multiple labels will occur at the same non zero column
          //this handles that case
          if (!containsLabel) {
            table[row][col] = chalk.blue(`${label}.`);
            // if the label is a left boundary of the table, save its position to row starters (it starts the row and is an across word)
            if (this.#isLeftBoundary(row, col, table)) {
              this.#rowStarters.push({ label: label, startingPos: row });
            }
            // if the label is a top boundary of the table, save its position to column starters (it starts the column and is a down word)
            if (this.#isTopBoundary(row, col, table)) {
              this.#columnStarters.push({ label: label, startingPos: col });
            }
          } else if (labeled.has(col)) {
            continue;
          } else {
            table[row][col] = chalk.blue(`${label}.`);
            // if the label is a left boundary of the table, save its position to row starters (it starts the row and is an across word)
            if (this.#isLeftBoundary(row, col, table)) {
              this.#rowStarters.push({ label: label, startingPos: row });
            }
            // if the label is a top boundary of the table, save its position to column starters (it starts the column and is a down word)
            if (this.#isTopBoundary(row, col, table)) {
              this.#columnStarters.push({ label: label, startingPos: col });
            }
          }

          //increment label, and ensure we never add 0 to the set, as the zero index of every row always starts a row
          containsLabel = true;
          label += 1;
          if (col !== 0) {
            labeled.add(col);
          }
        }
      }
    }
    return table;
  }

  #createEmptyPuzzle() {
    //the keys of the across object are special
    //the keys are strings, and any spaces will block out the table cell, filling it with a ---
    const across = this.#globalPuzzle.across;

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
    const labeledTable = this.#labelRowsAndColumns(rows);
    this.#table.push(...labeledTable);

    console.log(this.#table.toString());
  }

  #initializeLabeledHints() {
    //when this function is called, the table has been created and labeled
    //we have saved which labels start rows, which labels start columns, and which labels do both
    //we now can append the hints to their corresponding labels and save it to the acrossHints and downHints array
    const puzzle_across = this.#globalPuzzle.across;
    const puzzle_down = this.#globalPuzzle.down;

    let i = 0;
    console.log(this.#rowStarters);
    console.log(this.#columnStarters);

    for (const key in puzzle_across) {
      this.#AcrossHints.push(
        `${this.#rowStarters[i].label}. ${puzzle_across[key]}`
      );
      i += 1;
    }

    i = 0;
    for (const key in puzzle_down) {
      this.#DownHints.push(
        `${this.#columnStarters[i].label}. ${puzzle_down[key]}`
      );
      i += 1;
    }
  }

  #displayHints() {
    console.log(this.#table.toString());
    console.log(
      // we dont need the first value, as it is the direction
      boxen(chalk.cyan(this.#AcrossHints.join("\n")), {
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
      boxen(chalk.red(this.#DownHints.join("\n")), {
        title: "Down",
        titleAlignment: "center",
        padding: 1,
        borderStyle: "round",
        textAlignment: "left",
        borderColor: "red",
      })
    );
  }

  async #chooseOptionsMenu() {
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
      this.#displayHints();
      await this.#chooseOptionsMenu();
    } else if (answers.direction === "check") {
      const isSolved = this.#checkCrossword();
      if (!isSolved) {
        await printFiglet("Not done yet", "slant");
        console.log(chalk.red("The crossword is incorrect or incomplete"));
      } else {
        await printFiglet("Hooray!", "slant");
        console.log();
        this.#solved = true;
      }
    } else if (answers.direction === "exit") {
      this.#solved = true;
    } else {
      await this.#chooseNumber(answers.direction);
    }
  }

  #isValidNumber = (number) => {
    return !isNaN(number) && number !== "";
  };

  #chooseNumber = async (direction) => {
    const answer = await inquirer.prompt({
      name: "number",
      type: "input",
      message: "Which hint would you like to try? (Input number)",
    });
    if (await this.#isValidNumber(answer.number)) {
      console.log(chalk.green(`You chose ${direction} hint #${answer.number}`));
      await this.#inputAnswer(answer.number, direction);
    } else {
      console.log(chalk.red("Please input a valid number"));
      await this.#chooseNumber(direction);
    }
  };

  async #modifyRow(answer, i) {
    const row = this.#table[i];
    let leftPointer = 0;

    for (
      let k = 0;
      i < this.#table[i].length && leftPointer < answer.length;
      k++
    ) {
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
    this.#table[i] = row;
  }
  #modifyColumn(answer, column) {
    let leftPointer = 0;
    for (const row of this.#table) {
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
  }

  async #inputAnswer(label, direction) {
    const hint =
      direction === this.#across
        ? this.#AcrossHints.filter((hint) => hint[0] == label)
        : this.#DownHints.filter((hint) => hint[0] == label);

    const answer = await inquirer.prompt({
      name: "answer",
      type: "input",
      message: `${chalk.yellow(hint[0])}\nInput your answer:`,
    });

    if (direction === this.#across) {
      const startingRow = getStartingRowPosition(label, this.#rowStarters);
      // if the inputted answer is invalid, ask again
      if (
        !(await acrossAnswerIsValid(answer.answer, this.#table[startingRow]))
      ) {
        await this.#inputAnswer(label, direction);
        //otherwise, modify the row
      } else {
        await this.#modifyRow(answer.answer.toUpperCase(), startingRow);
      }
    } else {
      const startingColumn = getStartingColumnPosition(
        label,
        this.#columnStarters
      );
      // if the inputted answer is invalid, ask again
      if (
        !(await downAnswerIsValid(answer.answer, this.#table, startingColumn))
      ) {
        await this.#inputAnswer(label, direction);
        //otherwise. modify the column
      } else {
        await this.#modifyColumn(answer.answer.toUpperCase(), startingColumn);
      }
    }
    this.#displayHints();
  }

  #checkCrossword() {
    //we only need to check if all across words are correct, b/c if they are, then the down words are correct too
    for (const row of this.#table) {
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
      if (!this.#answerSet.has(acrossWord)) {
        return false;
      }
    }
    return true;
  }

  async #choosePuzzle() {
    const choices = [];
    for (let i = 0; i < this.#puzzles.length; i++) {
      choices.push({ name: chalk.cyan(`Puzzle ${i + 1}`), value: `${i}` });
    }
    const answer = await inquirer.prompt({
      name: "puzzle",
      type: "list",
      message: chalk.magenta(`Choose the puzzle you'd like to play`),
      choices: choices,
    });

    return this.#puzzles[answer.puzzle];
  }

  async startCrossword() {
    if (this.#puzzles.length === 0) {
      console.log(
        chalk.red("You must add a puzzle to crossword before starting.")
      );
      return;
    }
    const puzzle = await this.#choosePuzzle();
    this.#globalPuzzle = puzzle;
    this.#initializeTable();
    this.#initializeAnswerSet();
    this.#createEmptyPuzzle();
    this.#initializeLabeledHints();

    await printFiglet("Terminal Crossword Time", "slant");
    this.#displayHints();
    while (!this.#solved) {
      await this.#chooseOptionsMenu(puzzle);
    }
  }
} //class end =====

export default Crossword;
