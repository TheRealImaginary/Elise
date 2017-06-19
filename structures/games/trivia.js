const axios = require('axios');
const winston = require('winston');
const { RichEmbed } = require('discord.js');
const { shuffle } = require('./../../util/randomizer');
const Game = require('./game');

const triviaTime = 12;
const numbers = ['1', '2', '3', '4'];

/**
 * Represents a Trivia Game being played by the User.
 * @extends Game
 */
module.exports = class Trivia extends Game {
  /**
   * Instantiates a Trivia Game.
   * @param {Bot} client - Represents the Bot.
   * @param {Message} message - Represents the Message that triggered the Trivia Game.
   * @param {object} options - Options for the Trivia Game.
   */
  constructor(client, message, options) {
    super(client, message.author);
    this.trivia = null;
    this.triviaOptions = options;
    client.games.set(this.player.id, this);
    this.play(message);
  }

  async play(message) {
    this.trivia = await this.getTrivia(message, this.triviaOptions);
    this.trivia = await this.trivia;
    if (!this.trivia) {
      this.endGame();
      return;
    }
    const answers = this.answers;
    const correctAnswer = this.trivia.correct_answer;
    await message.embed(this.triviaEmbed);
    try {
      const filter = msg => msg.author.id === this.player.id
        && numbers.includes(msg.content.trim());
      const isCorrect = answer => answer.split('. ')[1] === correctAnswer;
      let guess = await message.channel
        .awaitMessages(filter, { max: 1, time: triviaTime * 1000, errors: ['time'] });
      guess = guess.first().content.trim();
      if (guess - 1 === answers.findIndex(isCorrect)) {
        this.award(message);
      } else {
        message.say(`Incorrect answer ! Correct answer is ${correctAnswer}`);
      }
    } catch (error) {
      message.say(`Time is up ! Correct answer is ${correctAnswer}`);
    }
    this.endGame();
  }

  /**
   * Represents the Trivia Question/Answers as an Embed Message.
   * @readonly
   */
  get triviaEmbed() {
    const { category, type, difficulty, question } = this.trivia;
    const embed = new RichEmbed();
    const answers = this.answers;
    embed.setColor('RANDOM');
    embed.setAuthor(`Info: ${category} | ${type} | ${difficulty}`);
    embed.setTitle(`You have **${triviaTime} seconds** to answer !`);
    embed.addField('➤Question', `⬧${question}`);
    embed.addField('➤Answers', answers.join('\n'));
    embed.setTimestamp(new Date());
    embed.setFooter(this.client.user.username, this.client.user.displayAvatarURL);
    return embed;
  }

  get answers() {
    const { correct_answer: correctAnswer, incorrect_answers: incorrectAnswers } = this.trivia;
    const answers = [].concat(incorrectAnswers);
    answers.push(correctAnswer);
    shuffle(answers);
    return answers.map((answer, index) => `${index + 1}. ${answer}`);
  }

  async getTrivia(message, { category, difficulty, type }) {
    const { data } = await axios.get('https://opentdb.com/api.php?', {
      params: {
        amount: 1,
        category: this.parse(category),
        difficulty: this.parse(difficulty),
        type: this.parse(type),
      },
    }).catch(err => this.handleError(message, err));
    if (!data.results || data.results.length === 0) {
      message.say('No Questions in this Category !');
      return null;
    }
    winston.info('[TRIVIA]: Trivia data ', data.results[0]);
    return data.results[0];
  }

  award(message) {
    message.say(`Correct ! ${this.trivia.correct_answer} is the correct answer !`);
  }

  parse(property) {
    return property === 'any' ? '' : property;
  }

  handleError(message, err) {
    this.client.emit('error', err);
    message.say('An Error Occured Fetching Trivia Question !');
  }
};
