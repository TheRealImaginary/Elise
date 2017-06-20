const { Command } = require('discord.js-commando');
const { triviaCategories } = require('../../util/constants');
const Trivia = require('../../structures/games/trivia');

const multiple = ['mcq', 'multiple', 'choice'];
const trueOrFalse = ['tf', 'true/false', 'boolean'];

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
        validate(value) {
          if (value === 'any') {
            return true;
          }
          if (isNaN(value)) {
            const index = triviaCategories.findIndex(el => (el.split('.')[1].trim().toLowerCase() === value
              || el === value.toLowerCase()));
            if (index >= 0) {
              return true;
            }
            return 'Category must be either an Index or a valid Category from the list.';
          }
          value = parseInt(value, 10) - 1;
          return value >= 0 && value <= 23 ? true : 'Number must be between 1 and 23 !';
        },
        parse(value) {
          if (value.toLowerCase() === 'any') {
            return 'any';
          }
          if (isNaN(value)) {
            value = value.toLowerCase();
            return triviaCategories.findIndex(el => (el.split('.')[1].trim().toLowerCase() === value
              || el === value.toLowerCase())) + 8;
          }
          return parseInt(value.toLowerCase(), 10) + 8;
        },
      }, {
        key: 'difficulty',
        prompt: 'What difficulty would you like me to set ?',
        type: 'string',
        default: 'any',
        validate(value) {
          const difficulties = ['easy', 'medium', 'hard', 'any'];
          return difficulties
            .includes(value.toLowerCase()) ? true : `Difficulty should 
            be any of "${difficulties.join(', ')}"`;
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
          for any Type.`;
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
