require('dotenv').config();
const Discord = require('discord.js');

const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const botCommands = require('./commands');
const botPhrases = require('./phrases');

Object.keys(botCommands).forEach((key) => {
    bot.commands.set(botCommands[key].name, botCommands[key]);
});

// const phrases = [];
// Object.keys(botPhrases).forEach((key) => {
//     phrases.
// });

const { TOKEN } = process.env;

bot.login(TOKEN);

bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}`);
});

function getPhrase(words) {
    return Object.values(botPhrases).find((p) => words.includes(p.phrase));
}

async function executePhrase(phrase, message, words) {
    try {
        await phrase.execute(message, words);
    } catch (error) {
        console.error(error);
        message.reply(`Woops, something went wrong trying to parse the \`${phrase.phrase}\` phrase`);
    }
}

async function executeCommand(command, message, args) {
    try {
        await command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply(`Woops, something went wrong executing the \`${command.name}\` command`);
    }
}

bot.on('message', async (message) => {
    if (!message || !message.content || message.content.length === 0) {
        return;
    }

    // TODO: guard against replying to self
    // check if message author is bot.user.tag??

    const lowerCase = message.content.toLowerCase();
    const lowerCaseWords = lowerCase.split(/ +/);
    const originalWords = message.content.split(/ +/);

    const firstWord = lowerCaseWords[0];
    const command = bot.commands.get(firstWord);
    const phrase = getPhrase(lowerCaseWords.join(' '));
    if (command) {
        originalWords.shift();
        await executeCommand(command, message, originalWords);
    } else if (phrase) {
        await executePhrase(phrase, message, originalWords);
    }
});
