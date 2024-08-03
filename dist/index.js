"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => src_default
});
module.exports = __toCommonJS(src_exports);
var import_cli_table3 = __toESM(require("cli-table3"));
var import_inquirer = __toESM(require("inquirer"));
var import_chalk = __toESM(require("chalk"));
var import_boxen = __toESM(require("boxen"));

// src/utils.ts
var import_figlet = __toESM(require("figlet"));
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
  await import_figlet.default.text(string, { font }, (err, data) => {
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
    const newTable = new import_cli_table3.default({
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
            table[row][col] = import_chalk.default.blue(`${label}.`);
            if (this.#isLeftBoundary(row, col, table)) {
              this.#rowStarters.push({ label, startingPos: row });
            }
            if (this.#isTopBoundary(row, col, table)) {
              this.#columnStarters.push({ label, startingPos: col });
            }
          } else if (labeled.has(col)) {
            continue;
          } else {
            table[row][col] = import_chalk.default.blue(`${label}.`);
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
      (0, import_boxen.default)(import_chalk.default.cyan(this.#AcrossHints.join("\n")), {
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
      (0, import_boxen.default)(import_chalk.default.red(this.#DownHints.join("\n")), {
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
    const answers = await import_inquirer.default.prompt({
      name: "direction",
      type: "list",
      //@ts-ignore
      message: `Choose any option. 
`,
      choices: [
        { name: import_chalk.default.cyan("Across"), value: "across" },
        { name: import_chalk.default.red("Down"), value: "down" },
        { name: import_chalk.default.yellow("Display Hints"), value: "hints" },
        { name: import_chalk.default.green("Check Puzzle"), value: "check" },
        { name: import_chalk.default.magenta("Exit"), value: "exit" }
      ]
    });
    if (answers.direction === "hints") {
      this.#displayHints();
      await this.#chooseOptionsMenu();
    } else if (answers.direction === "check") {
      const isSolved = this.#checkCrossword();
      if (!isSolved) {
        await printFiglet("Not done yet", "slant");
        console.log(import_chalk.default.red("The crossword is incorrect or incomplete"));
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
    const answer = await import_inquirer.default.prompt({
      name: "number",
      type: "input",
      //@ts-ignore
      message: "Which hint would you like to try? (Input number)"
    });
    if (await this.#isValidNumber(answer.number)) {
      console.log(import_chalk.default.green(`You chose ${direction} hint #${answer.number}`));
      await this.#inputAnswer(answer.number, direction);
    } else {
      console.log(import_chalk.default.red("Please input a valid number"));
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
    const answer = await import_inquirer.default.prompt({
      name: "answer",
      type: "input",
      //@ts-ignore
      message: `${import_chalk.default.yellow(hint[0])}
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
      choices.push({ name: import_chalk.default.cyan(`Puzzle ${i + 1}`), value: `${i}` });
    }
    const answer = await import_inquirer.default.prompt({
      name: "puzzle",
      type: "list",
      //@ts-ignore
      message: import_chalk.default.magenta(`Choose the puzzle you'd like to play`),
      choices
    });
    return this.#puzzles[answer.puzzle];
  }
  async startCrossword() {
    if (this.#puzzles.length === 0) {
      console.log(
        import_chalk.default.red(
          "You must add a crossword puzzle before starting the crossword."
        )
      );
      return;
    }
    const puzzle = await this.#choosePuzzle();
    if (!puzzle) {
      console.log(import_chalk.default.red("Error: The chosen puzzle is invalid"));
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
