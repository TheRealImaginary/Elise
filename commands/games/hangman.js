const { Command } = require('discord.js-commando');
const Hangman = require('../../structures/games/hangman');

module.exports = class HangmanCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'hangman',
      aliases: [],
      autoAliases: false,
      group: 'games',
      memberName: 'hangman',
      description: 'Starts a Hangman Game',
      throttling: {
        usages: 3,
        duration: 10,
      },
    });
  }

  run(message) {
    if (this.client.games.has(message.author.id)) {
      message.say('You cannot play multiple games at once !');
    } else {
      new Hangman(this.client, message, {});
    }
  }
};
