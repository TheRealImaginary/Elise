const { Command } = require('discord.js-commando');
const { triviaCategories } = require('../../util/constants');

module.exports = class TriviaCategories extends Command {
  constructor(client) {
    super(client, {
      name: 'trivia-categories',
      aliases: ['tcat'],
      autoAliases: true,
      group: 'games',
      memberName: 'trivia-info',
      description: `Displays all Trivia Categories. You can choose them 
      by their Index or Full Name when starting a Trivia Game.`,
    });
  }

  async run(message) {
    await message.direct(triviaCategories.join('\n'));
    message.reply('Sent you a DM with information.');
  }
};
