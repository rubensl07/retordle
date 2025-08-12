import chalk from 'chalk';
import readline from 'readline';
import fs from 'fs/promises';

const languagesList = [
    {
        acronym: "en-US", name: "English",
    }, {
        acronym: "pt-BR", name: "Português",
    }
]
let keyList = [];
let wordList = [];
let attemptsLimit = 6;
let wordCharacterCount = 0;

async function loadJSON() {
    let jsonWordString = false;

    const jsonKeyListString = await fs.readFile('./data/en-US/valid-key.json', 'utf8');
    keyList = JSON.parse(jsonKeyListString);

    try {
        jsonWordString = await fs.readFile('./data/en-US/valid-words.json', 'utf8');
    } catch (error) {
        jsonWordString = jsonKeyListString;
    }
    wordList = JSON.parse(jsonWordString);
    return;
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
    while (true) {
        console.log(` ===========================================================\n|  _____  ______ _______ ____  _____  _____  _      ______  |\n| |  __ \\|  ____|__   __/ __ \\|  __ \\|  __ \\| |    |  ____| |\n| | |__) | |__     | | | |  | | |__) | |  | | |    | |__    |\n| |  _  /|  __|    | | | |  | |  _  /| |  | | |    |  __|   |\n| | | \\ \\| |____   | | | |__| | | \\ \\| |__| | |____| |____  |\n| |_|  \\_\\______|  |_|  \\____/|_|  \\_\\_____/|______|______| |\n|                                                           |\n ===========================================================`);
        const resultMenu = await menu();
        const choosenOption = (menuOptions[resultMenu - 1]);
        console.clear();
        await choosenOption.function();
    }
}

const menuOptions = [
    { title: "Iniciar", function: startGame }, { title: "Opções", function: openSettings }, { title: "Instruções", function: showInstructions }, { title: "Créditos", function: showCredits }, { title: "Sair", function: finish }
]

async function menu() {
    let repeatedMessage = false;

    while (true) {
        menuOptions.forEach((option, index) => {
            console.log(`${index + 1} - ${option.title}`)
        });
        const input = await question(`Digite uma opção${repeatedMessage ? " válida" : ""}: `);

        if (!isNaN(input) && input.trim() !== '' && input.trim() > 0 && input.trim() <= menuOptions.length) {
            return Number(input);
        }
        repeatedMessage = true;
    }
}

async function startGame() {
    const keyWord = (keyList[Math.floor(Math.random() * keyList.length)]).toUpperCase();
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

    while (attempts.length < attemptsLimit && gameResult === 0) {
        const input = await question("Digite seu palpite: ");
        const typedWord = input.trim().toUpperCase();
        if (typedWord.toLowerCase() === 'sair' || typedWord.toLowerCase() === 'exit') {
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
        0: "Puxa vida! Não foi dessa vez :(\n1 - Tentar novamente\n2 - Voltar ao menu",
        1: "Parabéns! Você acertou! \n1 - Jogar novamente\n2 - Voltar ao menu",
        2: "O jogo foi encerrado. \n1 - Jogar novamente\n2 - Voltar ao menu"
    };

    console.log(messages[gameResult] || "Opção inválida");

    while (true) {
        const input = await question("Digite sua ação: ");

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
            console.log("Quantidade de caracteres inválida.");
            return false;
        }

        if (!/^[a-zA-Z]+$/.test(typedWord)) {
            console.log("Apenas letras.");
            return false;
        }

        if (attempts.includes(typedWord)) {
            console.log("Você já usou esse palpite.");
            return false;
        }

        if (!wordList.includes(typedWord.toLowerCase())) {
            console.log("Palavra inválida.");
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

const settingsOptions = [
    { title: "Idioma" }, { title: "Máximo de chances" }, { title: "Voltar" }
]

async function openSettings() {
    while (true) {
        console.clear();
        settingsOptions.forEach((option, index) => {
            console.log(`${index + 1} - ${option.title}`)
        });
        const input = await question("Digite uma opção: ");

        if (!isNaN(input) && input.trim() !== '' && input.trim() > 0 && input.trim() <= menuOptions.length) {
            switch (Number(input)) {
                case 1:
                    await openLanguagePage()
                    break;
                case 2:
                    await openMaxChancePage();
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

    const input = await question("Caso deseje alterar o idioma, digite o idioma desejado: ");
    if (languagesList.some(lang => lang.acronym === input)) {
        changeLanguage(input)
    }
    return;
}

async function openMaxChancePage() {
    const defaultMaxChance = 6;
    console.log(`Aqui é possível configurar o número máximo de tentativas possíveis antes de finalizar o jogo.\nCaso não seja inserido nada, o será mantido o valor padrão (${defaultMaxChance})`)
    const input = await question("Insira o valor máximo de tentativas: ");
    if (!isNaN(input) && input.trim() !== '') {
        attemptsLimit = Number(input);
    } else {
        attemptsLimit = defaultMaxChance;
    }
    return;
}

function changeLanguage(desiredLanguage) {
    console.log(desiredLanguage)
}

async function showInstructions() {
    console.clear();
    console.log(`
================= INSTRUÇÕES =================

OBJETIVO:
Descobrir a palavra secreta em até ${attemptsLimit} tentativas.

COMO JOGAR:
1. Digite uma palavra válida com o número correto de letras.
2. Após cada tentativa, as letras serão coloridas:
   - ${chalk.green('Verde')}: letra correta na posição correta.
   - ${chalk.yellow('Amarelo')}: letra existe na palavra, mas em outra posição.
   - ${chalk.gray('Cinza')}: letra não está na palavra.

REGRAS:
- Apenas letras do alfabeto são permitidas.
- Palpites repetidos não serão contabilizados.
- É necessário digitar uma palavra válida no idioma escolhido.
- Você pode digitar "${chalk.cyan('sair')}" ou "${chalk.cyan('exit')}" para encerrar o jogo a qualquer momento.

DICAS:
- Observe o teclado exibido abaixo das tentativas para saber quais letras já foram usadas.
- Comece testando palavras com letras diferentes para descobrir mais rapidamente a composição da palavra secreta.

===============================================
    `);
    await question(`Aperte ENTER para retornar ao MENU`);
}


async function showCredits() {
    console.log(chalk.white(`

================= CRÉDITOS =================

Jogo desenvolvido por: Rubens Lobo
Contato: rubenslobodev@gmail.com
Github: https://github.com/rubensl07

Bibliotecas utilizadas:
- chalk (https://www.npmjs.com/package/chalk)
- readline (Node.js built-in)
- fs/promises (Node.js built-in)

Fontes e inspirações:
- Wordle original: Josh Wardle

Projeto open-source — contribuições são bem-vindas!

Repositórios utilizados:
- Palavras válidas em inglês: https://github.com/seanpatlan/wordle-words/blob/main/valid-words.csv
- Palavras chave em inglês: https://github.com/seanpatlan/wordle-words/blob/main/word-bank.csv
- Palavras chave em português: https://github.com/gabrielnov/termooo/blob/main/words.txt

==============================================
`));
    await question(`Aperte ENTER para retornar ao MENU`);
}

function finish() {
    process.exit();
};

main();