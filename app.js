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
let lang = {};

async function loadJSON() {
    let folderName = '';
    switch (currentLanguage) {
        case 'en':
            folderName = 'en-US'
            break;
        case 'pt':
            folderName = 'pt-BR'
            break;
    }

    let jsonWordString = false;

    const jsonKeyListString = await fs.readFile(`./data/${folderName}/valid-key.json`, 'utf8');
    keyList = JSON.parse(jsonKeyListString);

    try {
        jsonWordString = await fs.readFile(`./data/${folderName}/valid-words.json`, 'utf8');
    } catch (error) {
        jsonWordString = jsonKeyListString;
    }
    wordList = JSON.parse(jsonWordString);
    return;
}

async function loadLanguage() {
    lang = await getLanguage(currentLanguage)
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
        { title: lang.menu.start, function: startGame },
        { title: lang.menu.settings, function: openSettings },
        { title: lang.menu.instructions, function: showInstructions },
        { title: lang.menu.credits, function: showCredits },
        { title: lang.menu.exit, function: finish }
    ];
    while (true) {

        menuOptions.forEach((option, index) => {
            console.log(`${index + 1} - ${option.title}`)
        });
        const input = await question(lang.interactions.action+" ");
        // const input = await question(`Digite uma opção${repeatedMessage ? " válida" : ""}: `);

        if (!isNaN(input) && input.trim() !== '' && input.trim() > 0 && input.trim() <= menuOptions.length) {
            return Number(input);
        }
        // repeatedMessage = true;
    }
}

async function startGame() {
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
        2: chalk.yellow,
        3: chalk.green
    };

    console.clear();
    while (attempts.length < attemptsLimit && gameResult === 0) {
        const input = await question(lang.interactions.guess+ " ");
        const typedWord = input.trim().toUpperCase();
        if (typedWord.trim().toLowerCase() === lang.actions.cheat) {
            console.log(lang.messages.cheatResponse);
        }
        if (typedWord.trim().toLowerCase() === lang.actions.exit) {
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
        0: `${lang.messages.gameResults.lose}\n${lang.interactions.finishedGameOptions} `,
        1: `${lang.messages.gameResults.win}\n${lang.interactions.finishedGameOptions}`,
        2: `${lang.messages.gameResults.quit}\n${lang.interactions.finishedGameOptions} `
    };

    console.log(messages[gameResult]);

    while (true) {
        const input = await question(lang.interactions.action+" ");

        if (!isNaN(input) && input.trim() !== '' && input.trim() > 0 && input.trim() <= menuOptions.length) {
            if (Number(input) === 1) {
                startGame();
            } else {
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
            console.log(lang.messages.invalid_length);
            return false;
        }

        if (!/^[a-zA-Z]+$/.test(typedWord)) {
            console.log(lang.messages.letters_only);
            return false;
        }

        if (attempts.includes(typedWord)) {
            console.log(lang.messages.word_used);
            return false;
        }

        if (!wordList.includes(typedWord.toLowerCase())) {
            console.log(lang.messages.invalid_word);
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

async function openSettings() {
    while (true) {
        const settingsOptions = [
            { title: lang.settings.language }, { title: lang.settings.maxAttempts }, { title: lang.settings.back }
        ]
        console.clear();
        settingsOptions.forEach((option, index) => {
            console.log(`${index + 1} - ${option.title}`)
        });
        const input = await question(lang.interactions.action+" ");

        if (!isNaN(input) && input.trim() !== '' && input.trim() > 0 && input.trim() <= menuOptions.length) {
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

    const input = await question(lang.interactions.languageChange+" ");
    if (languagesList.some(lang => lang.acronym === input.toLowerCase()) && input != currentLanguage) {
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
    console.log(lang.messages.currentAttempts.replace("{attemptsNumber}", attemptsLimit));
    console.log(lang.messages.maxAttemptsChange.replace("{attemptsNumber}", defaultMaxAttempt));
    const input = await question(lang.interactions.maximumAttempts+" ");
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

    console.log(lang.instructions.title);
    console.log(lang.instructions.goal.replace("{attempts}", attemptsLimit));

    console.log("");
    lang.instructions.howToPlay.forEach(line => {
        console.log(line
            .replace("{green}", chalk.green('Green'))
            .replace("{yellow}", chalk.yellow('Yellow'))
            .replace("{gray}", chalk.gray('Gray'))
        );
    });

    console.log("");
    lang.instructions.rules.forEach(line => {
        console.log(line
            .replace("{exit}", chalk.cyan(lang.actions.exit))
        );
    });

    console.log("");
    lang.instructions.tips.forEach(line => console.log(line));

    console.log(lang.instructions.end);
    await question(lang.interactions.enter);
}



async function showCredits() {
    console.clear();
    console.log(chalk.white(lang.credits.title));
    console.log(lang.credits.dev);
    console.log(lang.credits.contact);
    console.log(lang.credits.github);

    console.log();
    lang.credits.libs.forEach((lib, index) => console.log(`${index==0?'':'- '}${lib}`));

    console.log();
    lang.credits.inspirations.forEach((item, index) => console.log(`${index==0?'':'- '}${item}`));

    console.log("\n" + lang.credits.openSource);

    console.log();
    lang.credits.repos.forEach((repo, index) => console.log(`${index==0?'':'- '}${repo}`));

    console.log(lang.credits.end);
    await question(lang.interactions.enter);
}


function finish() {
    process.exit();
};

main();