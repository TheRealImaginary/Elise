const { Command } = require('discord.js-commando');

module.exports = class Flip extends Command {
  constructor(client) {
    super(client, {
      name: 'flip',
      aliases: [],
      autoAliases: false,
      group: 'fun',
      memberName: 'flip',
      description: 'Flips the Tables!'
    });
  }

  run(message) {
    message.say('(╯°□°）╯︵ ┻━┻');
  }
};
