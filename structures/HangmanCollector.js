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
   * @param {TextChannel|DMChannel|GroupDMChannel} channel - Channel on which
   * Messages should be collected.
   * @param {CollectorFilter} filter - Filter function returning True/False.
   * @param {HangmanCollectorOptions} [options={}] - The options to be applied to this collector.
   */
  constructor(channel, filter, options = {}) {
    super(channel, filter, options);

    this.options.max = this.options.maxMatches;

    /**
     * Amount of acceptable Wrong Guesses.
     * @type {number}
     */
    this.wrongGuesses = options.wrongGuesses || 10;
  }

  handle(message) {
    if (message.channel.id !== this.channel.id) {
      return null;
    }
    this.received += 1;
    if (!this.filter(message)) {
      this.wrongGuesses -= 1;
      const check = this.wrongCheck();
      if (check) {
        this.stop(check);
        return null;
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
};
