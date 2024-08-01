import chalk from "chalk";
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

const boof = [["", "b", "b"], ['f', 'b', 'q'], ["", "w", "x", "z", ""]]
for(const bol of boof) {
    table.push(bol)
}

// table.push(["", "b", "b"], ["f", "b", "q"], ["", "w", "x", "z", ""]);
console.log(chalk.blueBright("Welcome to the game baby"));
console.log(table.toString());
