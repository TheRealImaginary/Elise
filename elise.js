const dotenv = require('dotenv');

dotenv.config();

const winston = require('winston');

winston.configure({
  transports: [
    new (winston.transports.Console)({ colorize: true }),
  ],
});

const { Constants } = require('discord.js');

const Client = require('./structures/bot');

const Events = Object.values(Constants.Events);

const { PREFIX, TOKEN, OWNER, ENABLED_EVENTS } = process.env;

const bot = new Client({
  commandPrefix: PREFIX,
  unknownCommandResponse: false,
  owner: OWNER,
  disableEveryone: true,
  disabledEvents: Events.filter(event => !ENABLED_EVENTS.split(',').includes(event)),
});

bot.on('ready', () => winston.info('[ELISE]: Elise is ready !'));

/* Advisable for a user to use `tag` command for if a command's name
 is as the Tag name this won't trigger. */
bot.on('unknownCommand', (message) => {
  if (message.channel.type !== 'dm' && !message.author.bot) {
    const args = { name: message.content.split(PREFIX)[1] };
    bot.registry.resolveCommand('tags:tag').run(message, args);
  }
});

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
    ['mod', 'Mod'],
    ['music', 'Music'],
    ['score', 'Score'],
    ['tags', 'Tags'],
    ['util', 'Util'],
    ['weather', 'Weather'],
  ])
  .registerCommandsIn(`${__dirname}/commands`);

bot.login(TOKEN);
