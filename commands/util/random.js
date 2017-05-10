const { Command } = require('discord.js-commando');
const { randomizer } = require('../../util/randomizer');

module.exports = class Random extends Command {
  constructor(client) {
    super(client, {
      name: 'random',
      aliases: [],
      autoAliases: false,
      group: 'util',
      memberName: 'random',
      description: 'Chooses a random item for a list',
      args: [{
        key: 'items',
        prompt: 'What choices do we have ?!',
        type: 'string',
        validate(list) {
          return typeof list === 'string' && list.trim().length > 0;
        },
        parse(list) {
          return list.split(',');
        }
      }]
    });
  }

  run(message, { items }) {
    const item = randomizer(items);
    if (item) {
      if (Math.random() < 0.5) {
        message.say('The Random choice is ' + item.trim());
      } else {
        message.say(`Go ${item.trim()}, I choose you.`);
      }
    } else {
      message.say('You didn\'t give me anything to choose from ! :(');
    }
  }
};
