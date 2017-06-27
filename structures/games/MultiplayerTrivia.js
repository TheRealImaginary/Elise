const winston = require('winston');
const he = require('he');
const { RichEmbed } = require('discord.js');
const { shuffle, capitalize, getTrivia } = require('../../util/util');
const Game = require('./game');

const triviaTime = 15;
const numbers = ['1', '2', '3', '4'];

/**
 * Represents a Trivia Game being played by multiple Users.
 * @extends Game
 */
module.exports = class MultiplayerTrivia extends Game {
  /**
   * Creates an instance of MultiplayerTrivia.
   * @param {any} client - Represents the Bot.
   * @param {Message} message - Represents the Message that triggered the Trivia Game.
   * @param {any} options - The Options for the Trivia Game.
   */
  constructor(client, message, options) {
    super(client, message.author);

    /**
     * The Users in the Game.
     * @type {Array<User>}
     */
    this.players = [this.player];

    /**
     * Trivia Data.
     * @type {Array<object>}
     */
    this.trivia = null;

    /**
     * Current Question.
     * @type {number}
     */
    this.currentQuestion = 0;

    /**
     * Trivia Options used by the Trivia Game.
     * @type {object}
     */
    this.triviaOptions = options;

    /**
     * Cached answers.
     */
    this._answers = null;

    /**
     * The Guild the game was triggered in.
     * @type {Guild}
     */
    this.guild = message.guild;

    this.client.guildGames.set(message.guild.id, this);
  }

  /**
   * Registers the Player in the Game.
   * @param {User} player - A User joining the Game.
   */
  join(player) {
    this.players.push(player);
    this.client.games.set(player.id, this);
  }

  async play(message) {
    this.trivia = await this.getTrivia(message);
    if (!this.trivia) {
      this.endGame();
      return;
    }
    let responded = [];
    const filter = (msg) => {
      if (this.players.findIndex(player => player.id === msg.author.id) >= 0
        && numbers.includes(msg.content.trim())) {
        if (!responded.includes(msg.author.id)) {
          responded.push(msg.author.id);
          return true;
        }
      }
      return false;
    };

    const isCorrect = (answer, correctAnswer) => answer.split('. ')[1] === correctAnswer;
    /* eslint-disable no-await-in-loop */
    while (this.currentQuestion < this.trivia.length) {
      const answers = this.answers;
      const correctAnswer = this.trivia.correct_answer;
      await message.embed(this.triviaEmbed);

      try {
        let guesses = await message.channel.awaitMessages(filter,
          { max: this.players.length, time: triviaTime * 1000, errors: ['time'] });
      } catch (collected) {
      }
      responded = [];
    }
    /* eslint-enable no-await-in-loop */
  }

  /**
   * Represents the Trivia Question/Answers as an Embed Message.
   * @readonly
   */
  get triviaEmbed() {
    const { category, type, difficulty, question } = this.trivia[this.currentQuestion];
    const answers = this.answers;
    const embed = new RichEmbed();
    embed.setColor('RANDOM');
    embed.setAuthor(`Info: ${category} | ${capitalize(type)} | ${capitalize(difficulty)}`);
    embed.setTitle(`You have **${triviaTime} seconds** to answer !`);
    embed.addField('➤Question', `⬧${he.decode(question)}`);
    embed.addField('➤Answers', answers.join('\n'));
    embed.setTimestamp(new Date());
    embed.setFooter(this.client.user.username, this.client.user.displayAvatarURL);
    return embed;
  }

  /**
   * Returns the answered shuffled and indexed.
   * @readonly
   */
  get answers() {
    if (this._answers) {
      return this._answers;
    }
    const { correct_answer: correctAnswer,
      incorrect_answers: incorrectAnswers } = this.trivia[this.currentQuestion];
    const answers = [].concat(incorrectAnswers);
    answers.push(correctAnswer);
    shuffle(answers);
    this._answers = answers.map((answer, index) => `${index + 1}. ${he.decode(answer)}`);
    return this._answers;
  }

  async getTrivia(message) {
    const { data } = await getTrivia(this.triviaOptions)
      .catch(err => this.handleError(message, err));
    if (!data || !data.results || data.results.length < this.triviaOptions.amount) {
      winston.info('[TRIVIA]: No Questions Found', this.triviaOptions);
      message.say('No Questions in this Category !');
      return null;
    }
    winston.info('[TRIVIA]: Trivia data ', data.results);
    return data.results;
  }

  handleError(message, err) {
    this.client.emit('error', err);
    message.say('An Error Occured Fetching Trivia Question !');
  }

  endGame() {
    this.players.forEach(player => this.client.games.delete(player.id));
    this.client.guildGames.delete(this.guild.id);
  }
};
