import figlet from "figlet";
import { Puzzle, RowOrColumnStarter } from "./types";
import CliTable3 from "cli-table3";
export const getStartingRowPosition = (
  label: number,
  rowStarters: RowOrColumnStarter[]
) => {
  for (const starter of rowStarters) {
    if (starter.label == label) {
      return starter.startingPos;
    }
  }
};

export const getStartingColumnPosition = (
  label: number,
  columnStarters: RowOrColumnStarter[]
) => {
  for (const starter of columnStarters) {
    if (starter.label == label) {
      return starter.startingPos;
    }
  }
};

export const getNumberFromChalkString = (string: string) => {
  const [first, second] = string.split(".");
  return first.at(-1);
};

export const isChalkNumber = (string: string) => {
  return !isNaN(Number(getNumberFromChalkString(string))) && string !== "";
  //   return !isNaN(chalkToNum[string]) && string !== "";
};

export const acrossAnswerIsValid = async (answer: string, row: string[]) => {
  const validRow = row.filter((space) => space !== "---");
  if (answer.length > validRow.length) {
    console.log(
      `Error: Input was too long. Must be ${row.length} characters or less`
    );
    return false;
  }
  return true;
};

export const downAnswerIsValid = (
  answer: string,
  table: CliTable3.Table,
  column: number
) => {
  let validColumnLength = 0;
  for (let i = 0; i < table.length; i++) {
    //@ts-ignore
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

export const isEmptyChalkString = (string: string) => {
  return string.length === 18;
};

export const isPopulatedChalkString = (string: string) => {
  return string.length === 19;
};

export const getValueFromChalkString = (string: string) => {
  return string.at(-1);
};

export const getAnswerSetFromPuzzle = (puzzle: Puzzle) => {
  const set = new Set();
  for (const key of [
    ...Object.keys(puzzle.across),
    ...Object.keys(puzzle.down),
  ]) {
    let formattedKey = key.trim().toUpperCase();
    set.add(formattedKey);
  }
  console.log(set);

  return set;
};

export const printFiglet = async (string: string, font: string) => {
  //@ts-ignore
  await figlet.text(string, { font: font }, (err, data) => {
    if (err) {
      console.log("figlet went wrong");
      return;
    }
    console.log(data);
  });
};
