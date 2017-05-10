const dotenv = require('dotenv');
const { Constants } = require('discord.js');

const Client = require('./util/bot');

dotenv.config();

const Events = Object.values(Constants.Events);

const { PREFIX, TOKEN, OWNER, ENABLED_EVENTS } = process.env;

const bot = new Client({
  commandPrefix: PREFIX,
  unknownCommandResponse: false,
  owner: OWNER,
  disableEveryone: true,
  disabledEvents: Events.filter(event => !ENABLED_EVENTS.split(',').includes(event))
});

bot.on('ready', () => console.log('Bot Ready!'));

bot.registry
  .registerDefaults()
  .registerTypesIn(`${__dirname}/types`)
  .registerGroups([
    ['info', 'Info'],
    ['weather', 'Weather'],
    ['util', 'Util'],
    ['mod', 'Mod']
  ])
  .registerCommandsIn(`${__dirname}/commands`);

bot.login(TOKEN);
