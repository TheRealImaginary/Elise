const { Command } = require('discord.js-commando');
const { triviaCategories } = require('../../util/constants');

module.exports = class TriviaCategories extends Command {
  constructor(client) {
    super(client, {
      name: 'trivia-categories',
      aliases: ['tcat', 'trivia-cat'],
      autoAliases: true,
      group: 'games',
      memberName: 'trivia-categories',
      description: `Displays all Trivia Categories. You can choose them 
      by their Index when starting a Trivia Game.`,
    });
  }

  async run(message) {
    await message.direct(triviaCategories.join('\n'));
    if (message.guild) {
      message.reply('Sent you a DM with information.');
    }
  }
};
