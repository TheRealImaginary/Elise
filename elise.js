let dotenv;
/* eslint-disable global-require*/
if (!process.env.NODE_ENV) {
  dotenv = require('dotenv');
  dotenv.config();
}

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

bot.on('ready', () => winston.info('Elise is ready !'));

bot.on('error', err => winston.error(err));

bot.registry
  .registerDefaults()
  .registerGroups([
    ['fun', 'Fun'],
    ['info', 'Info'],
    ['memes', 'Memes'],
    ['mod', 'Mod'],
    ['music', 'Music'],
    ['util', 'Util'],
    ['weather', 'Weather'],
  ])
  .registerCommandsIn(`${__dirname}/commands`);

bot.login(TOKEN);
