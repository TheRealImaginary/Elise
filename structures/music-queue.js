const MAX_QUEUE_SIZE = parseInt(process.env.MAX_QUEUE_SIZE, 10);

module.exports = class MusicQueue {
  constructor() {
    /**
     * Queue holding music info.
     * @type {Array<object>}
     */
    this.queue = [];

    /**
     * Voice Connection for this Queue.
     * @type {?VoiceConnection}
     */
    this.connection = null;

    /**
     * Whether Music is being played or no.
     * @type {boolean}
     */
    this.isPlaying = false;
  }

  /**
   * Shifts the Queue to the left, Removing the first item.
   */
  shift() {
    this.queue.shift();
  }

  /**
   * Gets the first item in the queue.
   * @type {object}
   * @readonly
   */
  get song() {
    return this.queue[0];
  }

  /**
   * Adds an Item to the Queue.
   * @param {object} item - Item to be added.
   * @returns {boolean} True if added successfully, False otherwise.
   */
  add(item) {
    if (this.queue.length === MAX_QUEUE_SIZE) {
      return false;
    } else if (this.queue.filter(song => song.title === item.title
      || song.url === item.url).length > 0) {
      return false;
    }
    this.queue.push(item);
    return true;
  }

  /**
   * Disconnects from the Voice Channel and Clears the Queue.
   * @returns {boolean} True if there was a connections and was terminated, False Otherwise.
   */
  disconnect() {
    if (this.connection) {
      this.connection.channel.leave();
      this.connection = null;
      this.isPlaying = false;
      this.queue = [];
      return true;
    }
    return false;
  }
};
