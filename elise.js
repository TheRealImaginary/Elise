const dotenv = require('dotenv');
const { Constants } = require('discord.js');

dotenv.config();

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

bot.on('ready', () => console.log('Bot Ready!'));

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
