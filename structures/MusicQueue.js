/**
 * Represents the Music Queue for a Guild.
 */
module.exports = class MusicQueue {
  /**
   * Creates an instance of MusicQueue.
   * @param {number} maxSize - Maximum size for the queue.
   */
  constructor(maxSize) {
    /**
     * Maximum size for the queue.
     * @type {number}
     */
    this.maxSize = maxSize;
    /**
     * Queue holding music info.
     * @type {Array<Song>}
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
   * Returns the first Song in the Queue.
   * @type {Song}
   * @readonly
   */
  get first() {
    return this.queue[0];
  }

  /**
   * Checks if the Queue is full or no.
   * @returns {boolean} True if Queue is full, False otherwise.
   */
  get isFull() {
    return this.queue.length === this.maxSize;
  }

  /**
   * Checks if a similar song has been added before to the Queue.
   * @param {any} song - The song to be checked.
   * @returns {boolean} - True if there is a duplicate, False otherwise.
   */
  hasDuplicate(song) {
    return this.queue.filter(s => s.id === song.id || s.title === song.title).length > 0;
  }

  /**
   * Adds an Item to the Queue.
   * @param {Song} song - Item to be added.
   */
  add(song) {
    this.queue.push(song);
  }

  /**
   * Returns the Queue's Length.
   * @type {number}
   * @readonly
   */
  get length() {
    return this.queue.length;
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
