// Periodic Table Challenge Game for Grade 8 Physical Science
// This TypeScript file contains both the Periodic Table Challenge and Density Calculator
// Define the elements we'll use in the game (simplified periodic table)
var elements = [
    {
        atomicNumber: 1,
        symbol: "H",
        name: "Hydrogen",
        atomicMass: 1.008,
        category: "Nonmetal",
        protons: 1,
        neutrons: 0,
        electrons: 1,
        clues: [
            "I am the lightest element",
            "I have 1 proton",
            "I make up most of the sun",
            "My name means 'water former'"
        ],
        image: "https://images.unsplash.com/photo-1566410824233-a8011929d600?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
        atomicNumber: 2,
        symbol: "He",
        name: "Helium",
        atomicMass: 4.0026,
        category: "Noble Gas",
        protons: 2,
        neutrons: 2,
        electrons: 2,
        clues: [
            "I am used in balloons to make them float",
            "I have 2 protons",
            "I am named after the Greek word for sun",
            "I am a noble gas that doesn't react with other elements"
        ],
        image: "https://images.unsplash.com/photo-1527440421615-5d0c83d9a3b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
        atomicNumber: 6,
        symbol: "C",
        name: "Carbon",
        atomicMass: 12.011,
        category: "Nonmetal",
        protons: 6,
        neutrons: 6,
        electrons: 6,
        clues: [
            "I have 6 protons and am essential for life",
            "I am the basis of organic chemistry",
            "In one form, I am used in pencils",
            "In another form, I am one of the hardest materials (diamond)"
        ],
        image: "https://images.unsplash.com/photo-1516468707160-ee6b211df914?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
        atomicNumber: 8,
        symbol: "O",
        name: "Oxygen",
        atomicMass: 15.999,
        category: "Nonmetal",
        protons: 8,
        neutrons: 8,
        electrons: 8,
        clues: [
            "I have 8 protons",
            "I make up about 21% of Earth's atmosphere",
            "I am necessary for respiration",
            "My name means 'acid producer'"
        ],
        image: "https://images.unsplash.com/photo-1581093196277-9f6e9b96cc6a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
        atomicNumber: 11,
        symbol: "Na",
        name: "Sodium",
        atomicMass: 22.990,
        category: "Alkali Metal",
        protons: 11,
        neutrons: 12,
        electrons: 11,
        clues: [
            "I have 11 protons",
            "I react violently with water",
            "I am a soft, silvery-colored alkali metal",
            "Combined with chlorine, I am used as table salt"
        ],
        image: "https://images.unsplash.com/photo-1578662996442-48f1845c1300?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
        atomicNumber: 13,
        symbol: "Al",
        name: "Aluminum",
        atomicMass: 26.982,
        category: "Post-transition Metal",
        protons: 13,
        neutrons: 14,
        electrons: 13,
        clues: [
            "I have 13 protons",
            "I am used in making cans and foil",
            "I am the most abundant metal in Earth's crust",
            "I am lightweight and resistant to corrosion"
        ],
        image: "https://images.unsplash.com/photo-1605559911160-a3d95d213904?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
        atomicNumber: 17,
        symbol: "Cl",
        name: "Chlorine",
        atomicMass: 35.453,
        category: "Halogen",
        protons: 17,
        neutrons: 18,
        electrons: 17,
        clues: [
            "I have 17 protons",
            "I am used to disinfect swimming pools",
            "I am a yellowish-green gas at room temperature",
            "I am highly reactive and form salts with metals"
        ],
        image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
        atomicNumber: 26,
        symbol: "Fe",
        name: "Iron",
        atomicMass: 55.845,
        category: "Transition Metal",
        protons: 26,
        neutrons: 30,
        electrons: 26,
        clues: [
            "I have 26 protons",
            "I am the most common element on Earth by mass",
            "I am used to make steel",
            "My oxide is known as rust"
        ],
        image: "https://images.unsplash.com/photo-1535951392014-e1201ef738b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
        atomicNumber: 29,
        symbol: "Cu",
        name: "Copper",
        atomicMass: 63.546,
        category: "Transition Metal",
        protons: 29,
        neutrons: 35,
        electrons: 29,
        clues: [
            "I have 29 protons",
            "I am used in electrical wiring",
            "I have a distinctive reddish-orange color",
            "I turn green when exposed to air (patina)"
        ],
        image: "https://images.unsplash.com/photo-1496661269814-a841e78df103?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
        atomicNumber: 47,
        symbol: "Ag",
        name: "Silver",
        atomicMass: 107.868,
        category: "Transition Metal",
        protons: 47,
        neutrons: 61,
        electrons: 47,
        clues: [
            "I have 47 protons",
            "I am the best conductor of electricity",
            "I am used in jewelry and photography",
            "My symbol comes from the Latin word 'argentum'"
        ],
        image: "https://images.unsplash.com/photo-1589182337358-2cb63099350c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
        atomicNumber: 79,
        symbol: "Au",
        name: "Gold",
        atomicMass: 196.967,
        category: "Transition Metal",
        protons: 79,
        neutrons: 118,
        electrons: 79,
        clues: [
            "I have 79 protons",
            "I am a precious metal used in jewelry",
            "I am very malleable and ductile",
            "My symbol comes from the Latin word 'aurum'"
        ],
        image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
        atomicNumber: 80,
        symbol: "Hg",
        name: "Mercury",
        atomicMass: 200.59,
        category: "Transition Metal",
        protons: 80,
        neutrons: 121,
        electrons: 80,
        clues: [
            "I have 80 protons",
            "I am the only metal that is liquid at room temperature",
            "I was formerly used in thermometers",
            "My symbol comes from the Latin word 'hydrargyrum'"
        ],
        image: "https://images.unsplash.com/photo-1564391899201-f4b9d8229228?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    }
];
// Initialize game state
var gameState = {
    currentElement: null,
    currentDensityProblem: null,
    score: 0,
    clueIndex: 0,
    gameMode: 'periodic',
    attempts: 0,
    correctAnswers: 0,
    level: 1
};
// Generate a random density problem based on difficulty
function generateDensityProblem(difficulty) {
    var mass, volume, unit;
    switch (difficulty) {
        case 'easy':
            // Simple whole numbers
            mass = Math.floor(Math.random() * 100) + 10; // 10-109g
            volume = Math.floor(Math.random() * 20) + 5; // 5-24cm³
            unit = 'g/cm³';
            break;
        case 'medium':
            // Decimal numbers
            mass = Math.floor(Math.random() * 1000) / 10 + 50; // 50-149.9g
            volume = Math.floor(Math.random() * 200) / 10 + 10; // 10-29.9cm³
            unit = 'g/cm³';
            break;
        case 'hard':
            // Unit conversion required
            var useKg = Math.random() > 0.5;
            if (useKg) {
                mass = Math.floor(Math.random() * 100) / 10 + 1; // 1-10.9kg
                volume = Math.floor(Math.random() * 1000) + 500; // 500-1499cm³
                unit = 'kg/cm³';
            }
            else {
                mass = Math.floor(Math.random() * 5000) + 1000; // 1000-5999g
                volume = Math.floor(Math.random() * 9) + 1; // 1-9L
                unit = 'g/L';
            }
            break;
        default:
            // Default to easy if invalid difficulty
            mass = Math.floor(Math.random() * 100) + 10;
            volume = Math.floor(Math.random() * 20) + 5;
            unit = 'g/cm³';
    }
    // Calculate the density
    var density = Number((mass / volume).toFixed(3));
    return { mass: mass, volume: volume, density: density, unit: unit, difficulty: difficulty };
}
// Function to start the Periodic Table Challenge game
function startPeriodicTableChallenge() {
    // Reset game state
    gameState.score = 0;
    gameState.clueIndex = 0;
    gameState.gameMode = 'periodic';
    gameState.attempts = 0;
    gameState.correctAnswers = 0;
    gameState.level = 1;
    gameState.currentDensityProblem = null;
    // Select a random element to start
    selectRandomElement();
    // Update UI
    updatePeriodicTableUI();
}
// Function to select a random element for the challenge
function selectRandomElement() {
    var randomIndex = Math.floor(Math.random() * elements.length);
    gameState.currentElement = elements[randomIndex];
    gameState.clueIndex = 0;
}
// Function to check if the selected element is correct
function checkElementAnswer(selectedSymbol) {
    if (!gameState.currentElement)
        return false;
    gameState.attempts++;
    if (selectedSymbol === gameState.currentElement.symbol) {
        // Correct answer
        gameState.score += 10 * (4 - gameState.clueIndex); // More points for fewer clues
        gameState.correctAnswers++;
        // Level up after every 3 correct answers
        if (gameState.correctAnswers % 3 === 0) {
            gameState.level++;
        }
        // Select a new element
        selectRandomElement();
        return true;
    }
    else {
        // Wrong answer
        if (gameState.clueIndex < 3) {
            // Show next clue
            gameState.clueIndex++;
        }
        return false;
    }
}
// Function to get the current clue
function getCurrentClue() {
    if (!gameState.currentElement)
        return "No element selected";
    if (gameState.clueIndex >= gameState.currentElement.clues.length) {
        return "No more clues available";
    }
    return gameState.currentElement.clues[gameState.clueIndex];
}
// Function to update the Periodic Table UI
function updatePeriodicTableUI() {
    // This function would update the HTML elements
    // In a real implementation, this would manipulate the DOM
    console.log("Current Clue:", getCurrentClue());
    console.log("Score:", gameState.score);
    console.log("Level:", gameState.level);
    if (gameState.currentElement) {
        console.log("Current Element:", gameState.currentElement.name);
    }
}
// Function to start the Density Calculator activity
function startDensityCalculator() {
    gameState.gameMode = 'density';
    gameState.score = 0;
    gameState.attempts = 0;
    gameState.correctAnswers = 0;
    gameState.level = 1;
    gameState.currentElement = null;
    // Generate a new density problem
    var difficulty = gameState.level <= 3 ? 'easy' : (gameState.level <= 6 ? 'medium' : 'hard');
    var problem = generateDensityProblem(difficulty);
    gameState.currentDensityProblem = problem;
    // Update UI
    updateDensityCalculatorUI();
}
// Function to check the density calculation answer
function checkDensityAnswer(userAnswer) {
    if (!gameState.currentDensityProblem)
        return false;
    gameState.attempts++;
    // Allow for small rounding differences (within 0.1)
    var isCorrect = Math.abs(userAnswer - gameState.currentDensityProblem.density) < 0.1;
    if (isCorrect) {
        // Correct answer
        gameState.score += 10 * gameState.level;
        gameState.correctAnswers++;
        // Level up after every 2 correct answers
        if (gameState.correctAnswers % 2 === 0) {
            gameState.level++;
        }
        // Generate a new problem
        var difficulty = gameState.level <= 3 ? 'easy' : (gameState.level <= 6 ? 'medium' : 'hard');
        gameState.currentDensityProblem = generateDensityProblem(difficulty);
        return true;
    }
    return false;
}
// Function to update the Density Calculator UI
function updateDensityCalculatorUI() {
    if (!gameState.currentDensityProblem)
        return;
    // This function would update the HTML elements
    // In a real implementation, this would manipulate the DOM
    console.log("Density Problem:");
    console.log("Mass: ".concat(gameState.currentDensityProblem.mass, " ").concat(gameState.currentDensityProblem.unit.split('/')[0]));
    console.log("Volume: ".concat(gameState.currentDensityProblem.volume, " ").concat(gameState.currentDensityProblem.unit.split('/')[1]));
    console.log("Score:", gameState.score);
    console.log("Level:", gameState.level);
}
// Example usage
console.log("Starting Periodic Table Challenge...");
startPeriodicTableChallenge();
// Example of checking an answer
console.log("Checking answer 'C'...");
var isCorrect = checkElementAnswer("C");
console.log("Answer correct:", isCorrect);
updatePeriodicTableUI();
// Example of switching to Density Calculator
console.log("\nSwitching to Density Calculator...");
startDensityCalculator();
// Example of checking a density calculation
if (gameState.currentDensityProblem) {
    var userAnswer = gameState.currentDensityProblem.density; // Simulating correct answer
    console.log("User answer:", userAnswer);
    console.log("Answer correct:", checkDensityAnswer(userAnswer));
    updateDensityCalculatorUI();
}
