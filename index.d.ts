type StringDictionary = {
  [key: string]: string;
};

type Puzzle = {
  across: StringDictionary;
  down: StringDictionary;
};

declare module "Crossword" {
  export default class Crossword {
    /**
    Adds a puzzle as a playable option once the game starts
     * @example
     ```
    const across = {"didit": "Oops, I __ again", "obama": "Dreams From My Father author",}
    const down = {"etas": "Greek H's", "dojo": "Martial arts school"}
    const puzzle = {across, down}
    crossword.addPuzzle(puzzle)
     ```
     */
    addPuzzle(puzzle: Puzzle): void;

    /**
    Takes in array of puzzles that get added as playable options
    * @example
    ```
    const across = {"didit": "Oops, I __ again", "obama": "Dreams From My Father author",}
    const down = {"etas": "Greek H's", "dojo": "Martial arts school"}
    const puzzle1 = {across, down}
    const puzzle2 = {across2, down2}
    crossword.addPuzzles([puzzle1, puzzle2])
     ```
     */
    addPuzzles(puzzles: Puzzle[]): void;

    getPuzzles(): Puzzle[];

    removePuzzle(index: number): void;

    clearPuzzles(): void;

    /**
     Starts the crossword puzzle
     *
     Will fail if a puzzle has not been added before this function call
     */
    async startCrossword(): Promise<void>;
  }
}
