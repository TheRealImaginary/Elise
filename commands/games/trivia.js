const { Command } = require('discord.js-commando');
const Trivia = require('../../structures/games/trivia');

module.exports = class TriviaCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'trivia',
      aliases: [],
      autoAliases: false,
      group: 'games',
      memberName: 'trivia',
      description: `Asks a Question given a Category, Difficulty, Type. 
      Awards Points if answered correctly. All inputs are Optional.`,
      args: [{
        key: 'category',
        prompt: 'What Category would you like to be asked in ?',
        type: 'string',
        default: 'any',
      }, {
        key: 'difficulty',
        prompt: 'What difficulty would you like me to set ?',
        type: 'string',
        default: 'any',
      }, {
        key: 'type',
        prompt: 'What Type of Questions would you like ? Multiple Choice or True/False ?',
        type: 'string',
        default: 'any',
      }],
    });
  }

  run(message, args) {
    if (this.client.games.has(message.author.id)) {
      message.say('You cannot play multiple games at once !');
    } else {
      new Trivia(this.client, message, args);
    }
  }
};
