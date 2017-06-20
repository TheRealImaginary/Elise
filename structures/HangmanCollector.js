const { MessageCollector } = require('discord.js');

/**
 * @typedef {MessageCollectorOptions} HangmanCollectorOptions
 * @property {number} wrongGuesses - Threshold for Message Content that Fail the Filter function.
 */

/**
 * Represents a Message Collector, Collecting messages without a time limit
 * Expires when either an amount of Messages fail the filter function or when
 * a specific amount of messages are collected.
 */
module.exports = class HangmanCollector extends MessageCollector {
  /**
   * Creates an instance of HangmanCollector.
   * @param {Message} message - Message which triggered Hangman Game.
   * @param {CollectorFilter} filter - Filter function returning True/False.
   * @param {HangmanCollectorOptions} [options={}] - The options to be applied to this collector.
   */
  constructor(message, filter, options = {}) {
    super(message.channel, filter, options);

    this.options.max = this.options.maxMatches;
    this.options.maxProcessed = 10000;

    /**
     * Represents the Player that triggered the Game.
     * @type {User}
     */
    this.player = message.author;

    /**
     * Wrong Guesses made during the game
     * @type {Set<string>}
     */
    this.wrong = new Set();

    /**
     * Amount of acceptable Wrong Guesses.
     * @type {number}
     */
    this.wrongGuesses = options.wrongGuesses || 10;
  }

  /**
   * @emits HangmanCollector#wrong
   */
  handle(message) {
    if (message.channel.id !== this.channel.id || message.author.bot
      || message.author.id !== this.player.id
      || message.content.startsWith(this.client.commandPrefix)) {
      return null;
    }
    this.received += 1;
    if (!this.filter(message) && !this.wrong.has(message.content)) {
      if (!this.ended) {
        this.wrongGuesses -= 1;
        this.wrong.add(message.content);
        this.emit('wrong', this.wrongGuesses);
        const check = this.wrongCheck();
        if (check) {
          this.stop(check);
          return null;
        }
      }
    }
    return {
      key: message.id,
      value: message.content,
    };
  }

  /**
   * Checks if this collector should end if we reach
   * Wrong Guesses limit.
   * @returns {string} Reason for ending the collecter.
   */
  wrongCheck() {
    return this.wrongGuesses === 0 ? 'wrong' : null;
  }

  postCheck(message) {
    const post = super.postCheck();
    if (post) {
      return post;
    }
    return message.content.length >= this.options.maxMatches ? 'limit' : null;
  }
};
