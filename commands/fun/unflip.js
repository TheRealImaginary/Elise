const { Command } = require('discord.js-commando');

module.exports = class Flip extends Command {
  constructor(client) {
    super(client, {
      name: 'unflip',
      aliases: ['unflip-table', 'table-unflip'],
      autoAliases: false,
      group: 'fun',
      memberName: 'unflip',
      description: 'UnFlips the Tables!',
    });
  }

  run(message) {
    message.say('┬─┬ ノ( ^_^ノ)');
  }
};
