const { Command } = require('discord.js-commando');

module.exports = class Coin extends Command {
  constructor(client) {
    super(client, {
      name: 'coin',
      aliases: [],
      autoAliases: false,
      group: 'fun',
      memberName: 'coin',
      description: 'Flips a coin !'
    });
  }

  run(message) {
    message.say(`It is ${Math.random() < 0.5 ? 'Heads' : 'Tails'}`);
  }
};
