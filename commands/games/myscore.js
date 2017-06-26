const { Command } = require('discord.js-commando');

module.exports = class MyScore extends Command {
  constructor(client) {
    super(client, {
      name: 'myscore',
      aliases: ['kitties', 'kittens'],
      autoAliases: false,
      group: 'games',
      memberName: 'myscore',
      description: 'Displays your Score !',
    });
  }

  async run(message) {
    const score = await this.client.scoreboard.getPoints(message.author.id);
    message.say(`You have ${score} Kittens !`);
  }
};
