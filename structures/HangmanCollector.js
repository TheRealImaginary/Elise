const EventEmitter = require('events').EventEmitter;

/**
 * A Message Collector that collects Messages sent or edited in a Channel.
 * Idea >> https://github.com/hydrabolt/discord.js/blob/master/src/structures/interfaces/Collector.js
 */
module.exports = class HangmanCollector extends EventEmitter {
  /**
   * Creates an instance of HangmanCollector.
   * @param {Channel} channel - The Channel on which Messages should be Collected.
   * @param {Function} filter - A Boolean Function to determine which Messages to collect.
   * @param {any} options - Options to be used by this collector.
   */
  constructor(channel, filter, options) {
    super();
    console.log(options);
    /**
     * Represents the Client.
     * @type {Bot}
     */
    this.client = channel.client;

    /**
     * Represents the Channel.
     * @type {channel}
     */
    this.channel = channel;

    /**
     * Represents the Filter Function.
     */
    this.filter = filter;

    /**
     * Options for this Collector.
     */
    this.options = options;

    /**
     * Whether this Collector has ended or no.
     */
    this.ended = false;

    /**
     * The function to be executed whenever a Message is edited or sent.
     */
    this.listener = this.handle.bind(this);

    /**
     * Represents the Timeout which is responsible for stopping the Collector
     * after a specified time duration ends.
     */
    this._timeout = null;

    /**
     * The Maximum number of wrong guesses.
     * @type {number}
     */
    this.options.wrongAttempts = this.options.wrongAttempts || 10;

    if (options.time && options.time > 0) {
      this._timeout = setTimeout(() => this.stop('time'), options.time);
    }

    this.client.on('message', this.listener);

    this.client.on('messageUpdate', this.listener);
  }

  /**
   * Ran when a Message is Sent or Edited.
   * @param {any} oldMessage - The Old Message.
   * @param {any} newMessage - The New Message.
   * @emits HangmanCollector#collect
   * @emits HangmanCollector#wrong
   */
  handle(oldMessage, newMessage) {
    const collect = this.get(oldMessage, newMessage);
    if (collect) {
      if (this.filter(newMessage || oldMessage)) {
        this.options.maxMatches -= newMessage ?
          newMessage.content.length : oldMessage.content.length;
        this.emit('collect', collect.value.content);
      } else if (!this.filter(newMessage || oldMessage)) {
        this.options.wrongAttempts -= 1;
        this.emit('wrong', this.options.wrongAttempts,
          newMessage ? newMessage.content : oldMessage.content);
      }
      const reason = this.postCheck();
      if (reason) {
        this.stop(reason);
      }
    }
  }

  /**
   * Ran when a Message is Sent or Edited.
   * @param {Message} oldMessage - The Old Message.
   * @param {Message} newMessage - The New Message.
   * @returns {?{key: Snowflake, value: Message}}
   */
  get(oldMessage, newMessage) {
    if (!newMessage) {
      newMessage = oldMessage;
    }
    if (newMessage.channel.id !== this.channel.id || newMessage.author.bot) {
      return null;
    }
    return {
      key: newMessage.id,
      value: newMessage,
    };
  }

  /**
   * Checks whether this Collector should end or no.
   * @returns {?string} Reason why the Collector should end if yes.
   */
  postCheck() {
    if (this.options.maxMatches <= 0) {
      return 'limit';
    } else if (this.options.wrongAttempts === 0) {
      return 'wrong';
    }
    return null;
  }

  /**
   * Ends this Collector with the specified reason.
   * @param {string} [reason='user'] - The Reason why this Collector ended.
   * @emits HangmanCollector#end
   */
  stop(reason = 'user') {
    if (!this.ended) {
      this.client.removeListener('message', this.listener);
      this.client.removeListener('messageUpdate', this.listener);
      if (this._timeout) {
        clearTimeout(this._timeout);
      }
      this.ended = true;
      this.emit('end', reason);
    }
  }
};
