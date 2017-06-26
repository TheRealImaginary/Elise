const winston = require('winston');
const he = require('he');
const { RichEmbed } = require('discord.js');
const { shuffle, capitalize, getTrivia } = require('../../util/util');
const Game = require('./game');

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
    const answers = this.answers;
    const correctAnswer = this.trivia.correct_answer;
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
