const { Command } = require('discord.js-commando');

module.exports = class EndHangman extends Command {
  constructor(client) {
    super(client, {
      name: 'endhangman',
      aliases: ['terminate-hangman', 'stop-hangman', 'hangme'],
      autoAliases: false,
      group: 'games',
      memberName: 'endgame',
      description: 'Ends a Hangman Game !',
    });
  }

  run(message) {
    if (this.client.games.has(message.author.id)) {
      this.client.games.get(message.author.id).endGame();
      message.say('Game has been terminated !');
    } else {
      message.say('You are not playing Hangman at the moment !');
    }
  }
};
