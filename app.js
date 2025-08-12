import chalk from 'chalk';
import readline from 'readline';
import fs from 'fs/promises';

let keyList = [];
let wordList = [];
let attemptsLimit = 6;
let wordCharacterCount = 0;

async function carregarJSON() {
  const jsonKeyListString = await fs.readFile('./data/valid-key.json', 'utf8');
  keyList = JSON.parse(jsonKeyListString);
  const jsonWordString = await fs.readFile('./data/valid-words.json', 'utf8');
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
    await carregarJSON();
    console.log(` ===========================================================\n|  _____  ______ _______ ____  _____  _____  _      ______  |\n| |  __ \\|  ____|__   __/ __ \\|  __ \\|  __ \\| |    |  ____| |\n| | |__) | |__     | | | |  | | |__) | |  | | |    | |__    |\n| |  _  /|  __|    | | | |  | |  _  /| |  | | |    |  __|   |\n| | | \\ \\| |____   | | | |__| | | \\ \\| |__| | |____| |____  |\n| |_|  \\_\\______|  |_|  \\____/|_|  \\_\\_____/|______|______| |\n|                                                           |\n ===========================================================`);
    while(true){
        const resultMenu = await menu();
        const choosenOption = (menuOptions[resultMenu-1]);
        await choosenOption.function();
    }
}

const menuOptions = [
    {title: "Iniciar", function: startGame}, {title: "Opções", function: openOptions}, {title: "Instruções", function: showInstructions}, {title: "Créditos", function: showCredits}, {title: "Sair", function: finish}
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

async function startGame(){
    const keyWord = (keyList[Math.floor(Math.random() * keyList.length)]).toUpperCase();
    console.log(keyWord);
    wordCharacterCount = keyWord.length;
    let gameResult = false;
    const attempts = [];

    while (attempts.length < attemptsLimit && !gameResult) {
        let input = await question("Digite seu palpite: ");
        input = input.trim().toUpperCase();
        if(input.length === wordCharacterCount){
            if(attempts.includes(input)){
                console.log("Você já usou esse palpite.");
                continue;
            } 
            gameResult = compareWords(keyWord, input);
            attempts.push(input);
        }
        attempts.forEach(attempt => {
            console.log(coloringLetters(keyWord, attempt));
        });
    }

    if(!gameResult){
        console.log(chalk.green(keyWord))
    }

    if(gameResult){
        console.log(`Parabéns! Você acertou! \n1 - Jogar novamente\n2 - Voltar ao menu`);
    } else {
        console.log(`Puxa vida! Não foi dessa vez :(\n1 - Tentar novamente\n2 - Voltar ao menu`);
    }

    while (true) {
        const input = await question("Digite sua ação: ");

        if (!isNaN(input) && input.trim() !== '' && input.trim() > 0 && input.trim() <= menuOptions.length) {
            if(Number(input)===1){
                startGame();
            } else {
                break;
            }
        }
    }
}

function compareWords(keyWord, typedWord){
    return keyWord.toUpperCase() == typedWord.toUpperCase();
}

function coloringLetters(keyWord, typedWord){
    let coloredLetters = [];
    for (let index = 0; index < wordCharacterCount; index++) {
        if(keyWord[index] === typedWord[index]){
            coloredLetters.push(chalk.green(keyWord[index]));
        } else {
            coloredLetters.push(typedWord[index]);
        }
        // } else if(keyWord.indexOf(typedWord[index]) !== -1) {
        //     keyWord.indexOf(typedWord[index])
        // }
    }

    const coloredWord = coloredLetters.join('');
    return coloredWord;
}

function openOptions(){
    console.log('Options');
}

function showInstructions(){
    console.log('INSTRUÇÕES');
}

function showCredits(){
    console.log('CRÉDITOS');
}

function finish() {
    rl.close();
};

main();