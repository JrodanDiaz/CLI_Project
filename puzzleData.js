class Puzzle {
    constructor(across, down) {
      this.across = across;
      this.down = down;
    }
  }

const across1 = {
    "  ate": "downed",
    "didit": "Oops, I __ again",
    "obama": "Dreams From My Father author",
    "james": "Fifty Shades of Grey author E.L __",
    "ors  ": "Surgery sites, for short",
};

const down1 = {
    "adams": "Douglas, who wrote Hitchhiker's Guide to the Galaxy",
    "time": "A metronome keeps it",
    "etas": "Greek H's",
    "dojo": "Martial arts school",
    "ibar": "Letter-shaped construction beam"
}

export const puzzle1 = new Puzzle(across1, down1)

const across2 = {
    "tab  ": "Keyboard key near the top left",
    "item ": "Hot couple, in celebrity gossip column",
    "feral": "Wild, as an animal",
    "furry": "Like many four-legged friends",
    "space": "keyboard key on the bottom"
}

const down2 = {
    "tiffs": "Little spats",
    "ateup": "Thoroughly devoured",
    "berra": "Yogi who said “Alway go to other people’s funerals otherwise they won’t come to yours”",
    "marc": "Comedian Maron",
    "lye": "Caustic chemical compound"
}

export const puzzle2 = new Puzzle(across2, down2)

const across3 = {
    " rizz": "Style, charm or attractiveness, per a modern coinage",
    "homie": "Close bud",
    "omens": "Black cats and red moons, supposedly",
    "react": "Make a face, say",
    "non  ": "Prefix with fat or fiction"
}

const down3 = {
    "romeo": "Title Shakespeare role for a young DiCaprio",
    "imean": "“That is to say...”",
    "zinc": "Chemical element found in many immune-boosting supplements",
    "zest": "Finely grate, as a lemon peel",
    "horn": "Car's noisemaker"
}

export const puzzle3 = new Puzzle(across3, down3)

const across4 = {
    "rome ": "World capital with a museum dedicated entirely to pasta",
    "xbox ": "Console for the game Halo",
    "sixty": "Number of degrees in each angle of an equilateral triangle",
    " tire": "Inflatable bike part",
    " seat": "Spot in Congress"
}

const down4 = {
    "rxs": "Prescriptions, for short",
    "obits": "'In memoriam' pieces",
    "moxie": "Spunk",
    "extra": "For an additional cost",
    "yet": "'You ain't seen nothing ___!'"
}

export const puzzle4 = new Puzzle(across4, down4)