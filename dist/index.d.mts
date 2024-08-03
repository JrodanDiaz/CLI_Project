type StringDictionary = {
    [key: string]: string;
};
type Puzzle = {
    across: StringDictionary;
    down: StringDictionary;
};

declare class Crossword {
    #private;
    addPuzzle(puzzle: Puzzle): void;
    addPuzzles(puzzles: Puzzle[]): void;
    getPuzzles(): Puzzle[];
    removePuzzle(index: number): void;
    clearPuzzles(): void;
    startCrossword(): Promise<void>;
}

export { Crossword as default };
