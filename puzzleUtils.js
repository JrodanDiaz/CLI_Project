import figlet from "figlet";
export const getStartingRowPosition = (label, rowStarters) => {
  for (const starter of rowStarters) {
    if (starter.label == label) {
      return starter.startingPos;
    }
  }
};

export const getStartingColumnPosition = (label, columnStarters) => {
  for (const starter of columnStarters) {
    if (starter.label == label) {
      return starter.startingPos;
    }
  }
};

export const getNumberFromChalkString = (string) => {
  const [first, second] = string.split(".");
  return first.at(-1);
};

export const isChalkNumber = (string) => {
  return !isNaN(getNumberFromChalkString(string)) && string !== "";
  //   return !isNaN(chalkToNum[string]) && string !== "";
};

export const acrossAnswerIsValid = async (answer, row) => {
  const validRow = row.filter((space) => space !== "---");
  if (answer.length > validRow.length) {
    console.log(
      `Error: Input was too long. Must be ${row.length} characters or less`
    );
    return false;
  }
  return true;
};

export const downAnswerIsValid = (answer, table, column) => {
  let validColumnLength = 0;
  for (let i = 0; i < table.length; i++) {
    if (table[i][column] !== "---") {
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

export const isEmptyChalkString = (string) => {
  return string.length === 18;
};

export const isPopulatedChalkString = (string) => {
  return string.length === 19;
};

export const getValueFromChalkString = (string) => {
  return string.at(-1);
};

export const getAnswerSetFromPuzzle = (puzzle) => {
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

export const printFiglet = async (string, font) => {
  await figlet.text(string, { font: font }, (err, data) => {
    if (err) {
      console.log("figlet went wrong");
      return;
    }
    console.log(data);
  });
};
