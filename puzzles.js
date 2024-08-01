import CliTable3 from "cli-table3";
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
});
const puzzles = [];

//we need to run a check that the words intersect correctly
//maybe add functionality that allows for offsets
//maybe we should only take the across ones and label it accordingly
const across1 = {
  "  ate": "downed",
  "didit": "Oops, I __ again",
  "obama": "Dreams From My Father author",
  "james": "Fifty Shades of Grey author E.L __",
  "ors  ": "Surgery sites, for short",
};

const displayCompletedPuzzle = (across) => {
  //   puzzles.append({ down, across });
  const rows = []
  for (const answer in across) {
    const row = [];
    for (const i in answer) {
        // console.log(answer[i]);
      row.push(answer[i]);
    }
    // console.log(row);
    rows.push(row);
  }
  console.log(rows);
  table.push(...rows)
//   for(const row of rows) {
//     // console.log(row);
//     table.push(rows)
//   }
};

const createPuzzleFromTerminal = (down, downHints, across, acrossHints) => {
  //maybe error handling if the lengths of the arrays dont match?
  const downColumns = {};
  const acrossColumns = {};
  for (let i = 0; i < down.length; i++) {
    downColumns[down[i]] = downHints[i];
  }
  for (let i = 0; i < across.length; i++) {
    acrossColumns[across[i]] = acrossHints[i];
  }
};

displayCompletedPuzzle(across1);
console.log(table.toString());
