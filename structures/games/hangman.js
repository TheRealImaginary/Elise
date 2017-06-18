const Game = require('./game');

/**
 * Represents a Hangman Game.
 * @extends Game
 */
module.exports = class Hangman extends Game {
  constructor(client, message, options) {
    super(client, message.author);
    /**
     * Represents the word to be guessed.
     * @type {string}
     */
    this.word = '';
    /**
     * Represents the Message to be updated with the answer.
     * @type {Message}
     */
    this.hangmanMessage = null;
    /**
     * Represents the Hangman Options to start the Game with.
     * @type {object}
     */
    this.hangmanOptions = options;
    client.games.set(this.player.id, this);
    this.play(message);
  }

  play(message) {

  }
};
