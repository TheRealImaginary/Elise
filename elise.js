const dotenv = require('dotenv');

dotenv.config();

const { Constants } = require('discord.js');

const Client = require('./structures/bot');

const winston = require('winston');

const Events = Object.values(Constants.Events);

const { PREFIX, TOKEN, OWNER, ENABLED_EVENTS } = process.env;

winston.configure({
  transports: [
    new (winston.transports.Console)({ colorize: true }),
  ],
});

const bot = new Client({
  commandPrefix: PREFIX,
  unknownCommandResponse: false,
  owner: OWNER,
  disableEveryone: true,
  disabledEvents: Events.filter(event => !ENABLED_EVENTS.split(',').includes(event)),
});

bot.on('ready', () => winston.info('[ELISE]: Elise is ready !'));

bot.on('commandError', (command, err, { content }, args) => {
  winston.error(`Error executing command ${command.name} on inputs ${args} with content ${content}`);
});

bot.on('error', err => winston.error(err.message));

bot.registry
  .registerDefaults()
  .registerGroups([
    ['fun', 'Fun'],
    ['games', 'Games'],
    ['info', 'Info'],
    ['memes', 'Memes'],
    ['mod', 'Mod'],
    ['music', 'Music'],
    ['util', 'Util'],
    ['weather', 'Weather'],
  ])
  .registerCommandsIn(`${__dirname}/commands`);

bot.login(TOKEN);
