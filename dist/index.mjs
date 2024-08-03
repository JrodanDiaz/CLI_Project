// src/index.ts
import CliTable3 from "cli-table3";
import inquirer from "inquirer";
import chalk from "chalk";
import boxen from "boxen";

// src/utils.ts
import figlet from "figlet";
var getStartingRowPosition = (label, rowStarters) => {
  for (const starter of rowStarters) {
    if (starter.label == label) {
      return starter.startingPos;
    }
  }
};
var getStartingColumnPosition = (label, columnStarters) => {
  for (const starter of columnStarters) {
    if (starter.label == label) {
      return starter.startingPos;
    }
  }
};
var getNumberFromChalkString = (string) => {
  const [first, second] = string.split(".");
  return first.at(-1);
};
var isChalkNumber = (string) => {
  return !isNaN(Number(getNumberFromChalkString(string))) && string !== "";
};
var acrossAnswerIsValid = async (answer, row) => {
  const validRow = row.filter((space) => space !== "---");
  if (answer.length > validRow.length) {
    console.log(
      `Error: Input was too long. Must be ${row.length} characters or less`
    );
    return false;
  }
  return true;
};
var downAnswerIsValid = (answer, table, column) => {
  let validColumnLength = 0;
  for (let i = 0; i < table.length; i++) {
    if (table[i][column] !== "---") {
      validColumnLength++;
    }
  }
  if (answer.length > validColumnLength) {
    console.log(
      `Error: Input was too long. Must be ${validColumnLength} characters or less`
    );
    return false;
  }
  return true;
};
var isPopulatedChalkString = (string) => {
  return string.length === 19;
};
var getValueFromChalkString = (string) => {
  return string.at(-1);
};
var printFiglet = async (string, font) => {
  await figlet.text(string, { font }, (err, data) => {
    if (err) {
      console.log("figlet went wrong");
      return;
    }
    console.log(data);
  });
};

// src/index.ts
var Crossword = class {
  #puzzles = [];
  #globalPuzzle = null;
  #table = null;
  #answerSet = /* @__PURE__ */ new Set();
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
  //private methods
  #initializeTable() {
    if (!this.#globalPuzzle) return;
    const newTable = new CliTable3({
      chars: {
        top: "\u2550",
        "top-mid": "\u2564",
        "top-left": "\u2554",
        "top-right": "\u2557",
        bottom: "\u2550",
        "bottom-mid": "\u2567",
        "bottom-left": "\u255A",
        "bottom-right": "\u255D",
        left: "\u2551",
        "left-mid": "\u255F",
        mid: "\u2500",
        "mid-mid": "\u253C",
        right: "\u2551",
        "right-mid": "\u2562",
        middle: "\u2502"
      },
      wordWrap: true,
      colWidths: new Array(Object.values(this.#globalPuzzle.down).length).fill(
        5
      )
    });
    console.log(newTable.toString());
    this.#table = newTable;
  }
  #initializeAnswerSet() {
    const set = /* @__PURE__ */ new Set();
    for (const key of [
      //@ts-ignore
      ...Object.keys(this.#globalPuzzle.across),
      //@ts-ignore
      ...Object.keys(this.#globalPuzzle.down)
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
    const labeled = /* @__PURE__ */ new Set();
    let label = 1;
    for (let row = 0; row < table.length; row++) {
      let containsLabel = false;
      for (let col = 0; col < table[row].length; col++) {
        if (table[row][col] === "") {
          if (!containsLabel) {
            table[row][col] = chalk.blue(`${label}.`);
            if (this.#isLeftBoundary(row, col, table)) {
              this.#rowStarters.push({ label, startingPos: row });
            }
            if (this.#isTopBoundary(row, col, table)) {
              this.#columnStarters.push({ label, startingPos: col });
            }
          } else if (labeled.has(col)) {
            continue;
          } else {
            table[row][col] = chalk.blue(`${label}.`);
            if (this.#isLeftBoundary(row, col, table)) {
              this.#rowStarters.push({ label, startingPos: row });
            }
            if (this.#isTopBoundary(row, col, table)) {
              this.#columnStarters.push({ label, startingPos: col });
            }
          }
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
    const across = this.#globalPuzzle.across;
    const rows = [];
    for (const answer in across) {
      const row = [];
      for (const char in answer) {
        if (answer[char] === " ") {
          row.push("---");
        } else {
          row.push("");
        }
      }
      rows.push(row);
    }
    const labeledTable = this.#labelRowsAndColumns(rows);
    this.#table.push(...labeledTable);
    console.log(this.#table.toString());
  }
  #initializeLabeledHints() {
    if (!this.#globalPuzzle) return;
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
        borderColor: "cyan"
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
        borderColor: "red"
      })
    );
  }
  async #chooseOptionsMenu() {
    const answers = await inquirer.prompt({
      name: "direction",
      type: "list",
      //@ts-ignore
      message: `Choose any option. 
`,
      choices: [
        { name: chalk.cyan("Across"), value: "across" },
        { name: chalk.red("Down"), value: "down" },
        { name: chalk.yellow("Display Hints"), value: "hints" },
        { name: chalk.green("Check Puzzle"), value: "check" },
        { name: chalk.magenta("Exit"), value: "exit" }
      ]
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
    return !isNaN(number);
  };
  #chooseNumber = async (direction) => {
    const answer = await inquirer.prompt({
      name: "number",
      type: "input",
      //@ts-ignore
      message: "Which hint would you like to try? (Input number)"
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
    if (!this.#table) return;
    if (!this.#table) return;
    const row = this.#table[i];
    let leftPointer = 0;
    for (
      let k = 0;
      //@ts-ignore
      i < this.#table[i].length && leftPointer < answer.length;
      k++
    ) {
      if (row[k] === "---") {
        continue;
      }
      if (isChalkNumber(row[k])) {
        row[k] = `${row[k].substring(0, 12)}${answer[leftPointer]}`;
        leftPointer++;
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
      if (row[column] === "---") {
        continue;
      }
      if (isChalkNumber(row[column])) {
        row[column] = `${row[column].substring(0, 12)}${answer[leftPointer]}`;
        leftPointer++;
      } else {
        row[column] = `  ${answer[leftPointer]}`;
        leftPointer++;
      }
    }
  }
  async #inputAnswer(label, direction) {
    const hint = direction === "across" ? this.#AcrossHints.filter((hint2) => Number(hint2[0]) == label) : this.#DownHints.filter((hint2) => Number(hint2[0]) == label);
    const answer = await inquirer.prompt({
      name: "answer",
      type: "input",
      //@ts-ignore
      message: `${chalk.yellow(hint[0])}
Input your answer:`
    });
    if (direction === "across") {
      const startingRow = getStartingRowPosition(label, this.#rowStarters);
      if (
        //@ts-ignore
        !await acrossAnswerIsValid(answer.answer, this.#table[startingRow])
      ) {
        await this.#inputAnswer(label, direction);
      } else {
        await this.#modifyRow(answer.answer.toUpperCase(), startingRow);
      }
    } else {
      const startingColumn = getStartingColumnPosition(
        label,
        this.#columnStarters
      );
      if (
        //@ts-ignore
        !await downAnswerIsValid(answer.answer, this.#table, startingColumn)
      ) {
        await this.#inputAnswer(label, direction);
      } else {
        await this.#modifyColumn(answer.answer.toUpperCase(), startingColumn);
      }
    }
    this.#displayHints();
  }
  #checkCrossword() {
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
      //@ts-ignore
      message: chalk.magenta(`Choose the puzzle you'd like to play`),
      choices
    });
    return this.#puzzles[answer.puzzle];
  }
  async startCrossword() {
    if (this.#puzzles.length === 0) {
      console.log(
        chalk.red(
          "You must add a crossword puzzle before starting the crossword."
        )
      );
      return;
    }
    const puzzle = await this.#choosePuzzle();
    if (!puzzle) {
      console.log(chalk.red("Error: The chosen puzzle is invalid"));
      return;
    }
    this.#globalPuzzle = puzzle;
    this.#initializeTable();
    this.#initializeAnswerSet();
    this.#createEmptyPuzzle();
    this.#initializeLabeledHints();
    await printFiglet("Terminal Crossword Time", "slant");
    this.#displayHints();
    while (!this.#solved) {
      await this.#chooseOptionsMenu();
    }
  }
};
var src_default = Crossword;
export {
  src_default as default
};
