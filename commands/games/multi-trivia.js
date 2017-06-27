const { Command } = require('discord.js-commando');
const MultiplayerTrivia = require('../../structures/games/MultiplayerTrivia');

const triviaAmount = 10;
const difficulties = ['easy', 'medium', 'hard', 'any'];
const multiple = ['mcq', 'multiple', 'choice'];
const trueOrFalse = ['tf', 'true/false', 'boolean'];

module.exports = class MultiplayerTriviaCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'multiplayer-trivia',
      aliases: ['mtrivia', 'multi-trivia', 'trivia-multi', 'trivia-m'],
      group: 'games',
      memberName: 'multi-trivia',
      description: `Starts a Multiplayer Trivia Game or Joins one if exists, Users will have 14 seconds to join, 
      after which a series of ${triviaAmount} questions are asked and players are awarded according to 
      the order they answer in. **Two** or **more** players must join in order for the game to start.`,
      args: [{
        key: 'category',
        prompt: 'Which Category would you like to be asked in ?',
        type: 'string',
        default: 'any',
        validate(value) {
          if (value.toLowerCase() === 'any') {
            return true;
          }
          if (isNaN(value)) {
            return 'Category should either be a number between 1 and 23 or "any" !';
          }
          value = parseInt(value, 10) - 1;
          return value >= 0 && value <= 23 ? true : 'Category number must be between 1 and 23 !';
        },
        parse(value) {
          value = value.toLowerCase();
          return value === 'any' ? value : parseInt(value, 10) + 8;
        },
      }, {
        key: 'difficulty',
        prompt: 'What difficulty would you like me to set ?',
        type: 'string',
        default: 'any',
        validate(value) {
          return difficulties
            .includes(value.toLowerCase()) ? true : `Difficulty must 
            be any of "${difficulties.join(', ')}".`;
        },
        parse(value) {
          return value.toLowerCase();
        },
      }, {
        key: 'type',
        prompt: 'What Type of Questions would you like ? Multiple Choice or True/False ?',
        type: 'string',
        default: 'any',
        validate(value) {
          value = value.toLowerCase();
          if (multiple.includes(value) || trueOrFalse.includes(value) || value === 'any') {
            return true;
          }
          return `You can use any of "${multiple.join(', ')}" for MCQ Questions
          or any of "${trueOrFalse.join(', ')}" for True/False Questions. Use "any" or leave empty
          for any Type of Questions.`;
        },
        parse(value) {
          value = value.toLowerCase();
          if (multiple.includes(value)) {
            return 'multiple';
          } else if (trueOrFalse.includes(value)) {
            return 'boolean';
          }
          return 'any';
        },
      }],
      guildOnly: true,
    });
  }

  run(message, { category, difficulty, type }) {
    if (this.client.games.has(message.author.id)) {
      message.say('You cannot play mutiple games at once !');
    } else if (this.client.guildGames.has(message.guild.id)) {
      const game = this.client.guildGames.get(message.guild.id);
      if (game.joinable) {
        game.join(message.author);
        message.say(`${message.author.tag} has joined !`);
      } else {
        message.say('Game join duration is over !');
      }
    } else {
      const trivia = new MultiplayerTrivia(this.client, message, {
        amount: triviaAmount,
        category,
        difficulty,
        type,
      });
      message.say(`${message.author.tag} has started and joined a Trivia Game ! Use "mtrivia" to join ! 14 Second are left !`);
      setTimeout(() => message.say('4 seconds left to join !'), 10 * 1000);
      setTimeout(() => trivia.play(message), 15 * 1000);
    }
  }
};

