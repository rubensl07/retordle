import chalk from 'chalk';
import readline from 'readline';
import fs from 'fs/promises';

const languagesList = [
    {
        acronym: "en", name: "English",
    }, {
        acronym: "pt", name: "Português",
    }
]

let currentLanguage = "en";
let keyList = [];
let wordList = [];
let attemptsLimit = 6;
let wordCharacterCount = 0;
let translation = {};

async function loadJSON() {
    function getFolderNameByLanguage(language) {
    const map = {
        en: "en-US",
        pt: "pt-BR"
    };
    return map[language] || "en-US"; // padrão
}


function getDataPath(language, fileName) {
    return `./data/${getFolderNameByLanguage(language)}/${fileName}`;
}
       const keyListPath = getDataPath(currentLanguage, 'valid-key.json');
    const wordsPath = getDataPath(currentLanguage, 'valid-words.json');

    const jsonKeyListString = await fs.readFile(keyListPath, 'utf8');
    keyList = JSON.parse(jsonKeyListString);

    let jsonWordString;
    try {
        jsonWordString = await fs.readFile(wordsPath, 'utf8');
    } catch {
        jsonWordString = jsonKeyListString;
    }

    wordList = JSON.parse(jsonWordString);
}

async function loadLanguage() {
    translation = await getLanguage(currentLanguage)
}

async function getLanguage(language){
    return JSON.parse(
        await fs.readFile(`./lang/${language}.json`, 'utf8')
    );
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => {
        rl.question(query, resolve);
    });
}

async function main() {
    console.clear();
    await loadJSON();
    await loadLanguage();
    while (true) {
        console.log(` ===========================================================\n|  _____  ______ _______ ____  _____  _____  _      ______  |\n| |  __ \\|  ____|__   __/ __ \\|  __ \\|  __ \\| |    |  ____| |\n| | |__) | |__     | | | |  | | |__) | |  | | |    | |__    |\n| |  _  /|  __|    | | | |  | |  _  /| |  | | |    |  __|   |\n| | | \\ \\| |____   | | | |__| | | \\ \\| |__| | |____| |____  |\n| |_|  \\_\\______|  |_|  \\____/|_|  \\_\\_____/|______|______| |\n|                                                           |\n ===========================================================`);
        const resultMenu = await menu();
        const choosenOption = (menuOptions[resultMenu - 1]);
        console.clear();
        await choosenOption.function();
    }
}
let menuOptions = []
async function menu() {
    // let repeatedMessage = false;
    menuOptions = [
        { title: translation.menu.start, function: startGame },
        { title: translation.menu.settings, function: openSettings },
        { title: translation.menu.instructions, function: showInstructions },
        { title: translation.menu.credits, function: showCredits },
        { title: translation.menu.exit, function: finish }
    ];
    while (true) {

        menuOptions.forEach((option, index) => {
            console.log(`${index + 1} - ${option.title}`)
        });
        const input = await question(translation.interactions.action+" ");
        // const input = await question(`Digite uma opção${repeatedMessage ? " válida" : ""}: `);

        if (!isNaN(input) && input.trim() !== '' && input.trim() > 0 && input.trim() <= menuOptions.length) {
            return Number(input);
        }
        // repeatedMessage = true;
    }
}

async function startGame() {
    let playAgain = true;

    while(playAgain){

        const keyWord = (keyList[Math.floor(Math.random() * keyList.length)]).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    
        wordCharacterCount = keyWord.length;
        let gameResult = 0;
        const attempts = [];
        const letters = {
            "A": 0,
            "B": 0,
            "C": 0,
            "D": 0,
            "E": 0,
            "F": 0,
            "G": 0,
            "H": 0,
            "I": 0,
            "J": 0,
            "K": 0,
            "L": 0,
            "M": 0,
            "N": 0,
            "O": 0,
            "P": 0,
            "Q": 0,
            "R": 0,
            "S": 0,
            "T": 0,
            "U": 0,
            "V": 0,
            "W": 0,
            "X": 0,
            "Y": 0,
            "Z": 0
        }
    
        const colorMap = {
            0: (l) => l,
            1: chalk.gray,
            2: chalk.bgYellow,
            3: chalk.bgGreen
        };
    
        console.clear();
        while (attempts.length < attemptsLimit && gameResult === 0) {
            const input = await question(translation.interactions.guess+ " ");
            const typedWord = input.trim().toUpperCase();
            if (typedWord.trim().toLowerCase() === translation.actions.cheat) {
                console.log(translation.messages.cheatResponse);
            }
            if (typedWord.trim().toLowerCase() === translation.actions.exit) {
                gameResult = 2;
                break;
            }
    
            if (!validateWord(typedWord, wordCharacterCount, attempts))
                continue;
    
            console.clear();
    
            gameResult = (keyWord == typedWord) * 1;
            attempts.push(typedWord);
            attempts.forEach(attempt => {
                console.log(coloringLetters(keyWord, attempt));
            });
            if (gameResult != 0) {
                continue;
            }
    
            printKeyboard(letters, colorMap);
        }
    
    
        if (gameResult != 1) {
            console.log(chalk.green(keyWord))
        }
    
        const messages = {
            0: `${translation.messages.gameResults.lose}\n${translation.interactions.finishedGameOptions} `,
            1: `${translation.messages.gameResults.win}\n${translation.interactions.finishedGameOptions}`,
            2: `${translation.messages.gameResults.quit}\n${translation.interactions.finishedGameOptions} `
        };
    
        console.log(messages[gameResult]);
    
        while (true) {
            const input = await question(translation.interactions.action+" ");
    
            if (!isNaN(input) && input.trim() !== '' && input.trim() > 0 && input.trim() <= menuOptions.length) {
                if (Number(input) === 1) {
                    break; 
                } else {
                    playAgain = false;
                    break;
                }
            }
        }
    
        function coloringLetters(keyWord, typedWord) {
            const coloredLetters = [];
            const keyWordArr = keyWord.split('');
            const typedWordArr = typedWord.split('');
            const usedPositions = new Array(wordCharacterCount).fill(false);
    
            // Primeiro, marca verdes e marca as posições usadas
            for (let i = 0; i < wordCharacterCount; i++) {
                if (typedWordArr[i] === keyWordArr[i]) {
                    coloredLetters[i] = chalk.green(typedWordArr[i]);
                    letters[typedWordArr[i]] = 3;
                    usedPositions[i] = true;
                } else {
                    coloredLetters[i] = null; // placeholder para agora
                }
            }
    
            // Depois, marca amarelas e cinzas
            for (let i = 0; i < wordCharacterCount; i++) {
                if (coloredLetters[i] !== null) continue;
    
                const letter = typedWordArr[i];
                let foundYellow = false;
    
                for (let j = 0; j < wordCharacterCount; j++) {
                    if (!usedPositions[j] && keyWordArr[j] === letter) {
                        foundYellow = true;
                        usedPositions[j] = true;
                        break;
                    }
                }
    
                if (foundYellow) {
                    coloredLetters[i] = chalk.yellow(letter);
                    if (letters[letter] !== 3) letters[letter] = 2;
                } else {
                    coloredLetters[i] = chalk.gray(letter);
                    if (letters[letter] !== 3 && letters[letter] !== 2) letters[letter] = 1;
                }
            }
    
            return coloredLetters.join('');
        }
    
    
        function validateWord(typedWord, wordCharacterCount, attempts) {
            if (typedWord.length !== wordCharacterCount) {
                console.log(translation.messages.invalid_length);
                return false;
            }
    
            if (!/^[a-zA-Z]+$/.test(typedWord)) {
                console.log(translation.messages.letters_only);
                return false;
            }
    
            if (attempts.includes(typedWord)) {
                console.log(translation.messages.word_used);
                return false;
            }
    
            if (!wordList.includes(typedWord.toLowerCase())) {
                console.log(translation.messages.invalid_word);
                return false;
            }
            return true;
        }
    
        function printKeyboard(letters, colorMap) {
            const rows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
            rows.forEach(row => {
                console.log(row.split('').map(l => colorMap[letters[l]](l)).join(' '));
            });
        }
    }
}

async function openSettings() {
    while (true) {
        const settingsOptions = [
            { title: translation.settings.language }, { title: translation.settings.maxAttempts }, { title: translation.settings.back }
        ]
        console.clear();
        settingsOptions.forEach((option, index) => {
            console.log(`${index + 1} - ${option.title}`)
        });
        const input = await question(translation.interactions.action+" ");

        if (!isNaN(input) && input.trim() !== '' && input.trim() > 0 && input.trim() <= settingsOptions.length) {
            switch (Number(input)) {
                case 1:
                    await openLanguagePage()
                    break;
                case 2:
                    await openMaxAttemptsPage();
                    break;
                case 3:
                    return;
            }
        }
    }
}

async function openLanguagePage() {
    console.clear();
    languagesList.forEach((option) => {
        console.log(`${option.acronym} - ${option.name}`)
    });

    const input = await question(translation.interactions.languageChange+" ");
    if (languagesList.some(translation => translation.acronym === input.toLowerCase()) && input != currentLanguage) {
        const confirm = await openConfirmationLanguage(input) 
        if(confirm)
        await changeLanguage(input)
    }
    return;
}

async function openConfirmationLanguage(choosenLang){
    const languageObj = await getLanguage(choosenLang);
    const input = await question(languageObj.confirmationLanguage.message+" ");
    if(languageObj.confirmationLanguage.affirmative.includes(input.trim().toLowerCase()))
        return true
    return false
}

async function openMaxAttemptsPage() {
    const defaultMaxAttempt = 6;
    let colorAttempts = attemptsLimit==defaultMaxAttempt?'green':'red';
    console.log(chalk[colorAttempts](translation.messages.currentAttempts.replace("{attemptsNumber}", attemptsLimit)) );
    console.log(translation.messages.maxAttemptsChange.replace("{attemptsNumber}", defaultMaxAttempt));
    const input = await question(translation.interactions.maximumAttempts+" ");
    if (!isNaN(input) && input.trim() !== '') {
        attemptsLimit = Number(input);
    } else {
        attemptsLimit = defaultMaxAttempt;
    }
    return;
}

async function changeLanguage(desiredLanguage) {
    currentLanguage = desiredLanguage;
    await loadJSON();
    await loadLanguage();
    return
}

async function showInstructions() {
    console.clear();

    console.log(translation.instructions.title);
    console.log(translation.instructions.goal.replace("{attempts}", attemptsLimit));

    console.log("");
    translation.instructions.howToPlay.forEach(line => {
        console.log(line
            .replace("{green}", chalk.green('Green'))
            .replace("{yellow}", chalk.yellow('Yellow'))
            .replace("{gray}", chalk.gray('Gray'))
        );
    });

    console.log("");
    translation.instructions.rules.forEach(line => {
        console.log(line
            .replace("{exit}", chalk.cyan(translation.actions.exit))
        );
    });

    console.log("");
    translation.instructions.tips.forEach(line => console.log(line));

    console.log(translation.instructions.end);
    await question(translation.interactions.enter);
}



async function showCredits() {
    console.clear();
    console.log(chalk.white(translation.credits.title));
    console.log(translation.credits.dev);
    console.log(translation.credits.contact);
    console.log(translation.credits.github);

    console.log();
    translation.credits.libs.forEach((lib, index) => console.log(`${index==0?'':'- '}${lib}`));

    console.log();
    translation.credits.inspirations.forEach((item, index) => console.log(`${index==0?'':'- '}${item}`));

    console.log("\n" + translation.credits.openSource);

    console.log();
    translation.credits.repos.forEach((repo, index) => console.log(`${index==0?'':'- '}${repo}`));

    console.log(translation.credits.end);
    await question(translation.interactions.enter);
}


function finish() {
    process.exit();
};

main();