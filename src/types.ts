export type direction = "across" | "down";

type StringDictionary = {
  [key: string]: string;
};

export type Puzzle = {
  across: StringDictionary;
  down: StringDictionary;
};

export type RowOrColumnStarter = {
  label: number;
  startingPos: number;
};
