const winston = require('winston');
const he = require('he');
const { RichEmbed } = require('discord.js');
const { shuffle, capitalize, getTrivia } = require('./../../util/util');
const Game = require('./game');

const triviaTime = 15;
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
    /**
     * Trivia Data
     * @type {object}
     */
    this.trivia = null;

    /**
     * Trivia Options
     * @type {object}
     */
    this.triviaOptions = options;

    /**
     * Cached Answers after shuffling.
     * @type {Array<string>}
     */
    this._answers = null;

    /**
     * Message that Triggered the Game.
     * @type {Message}
     */
    this.message = message;

    this.play(message);
  }

  async play(message) {
    this.trivia = await this.getTrivia(message);
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
    embed.setAuthor(`Info: ${category} | ${capitalize(type)} | ${capitalize(difficulty)}`
      , this.message.author.displayAvatarURL);
    embed.setTitle(`You have **${triviaTime} seconds** to answer !`);
    embed.addField('➤Question', `⬧${he.decode(question)}`);
    embed.addField('➤Answers', answers.join('\n'));
    embed.setTimestamp(new Date());
    embed.setFooter(this.client.user.username, this.client.user.displayAvatarURL);
    return embed;
  }

  get answers() {
    if (this._answers) {
      return this._answers;
    }
    const { correct_answer: correctAnswer, incorrect_answers: incorrectAnswers } = this.trivia;
    const answers = [].concat(incorrectAnswers);
    answers.push(correctAnswer);
    shuffle(answers);
    this._answers = answers.map((answer, index) => `${index + 1}. ${he.decode(answer)}`);
    return this._answers;
  }

  async getTrivia(message) {
    const { data } = await getTrivia(this.triviaOptions)
      .catch(err => this.handleError(message, err));
    if (!data || !data.results || data.results.length === 0) {
      winston.info('[TRIVIA]: No Questions Found', this.triviaOptions);
      message.say('No Questions in this Category !');
      return null;
    }
    winston.info('[TRIVIA]: Trivia data ', data.results[0]);
    return data.results[0];
  }

  async award(message) {
    await this.client.scoreboard.award(this.player.id, 100);
    message.say(`Correct ! ${this.trivia.correct_answer} is the correct answer ! You gained 100 Kittens !`);
  }

  handleError(message, err) {
    this.client.emit('error', err);
    message.say('An Error Occured Fetching Trivia Question !');
  }
};
