module.exports = class MusicQueue {
  constructor() {
    this.queue = [];

    this.connection = null;

    this.isPlaying = false;
  }

  shift() {
    this.queue.shift();
  }

  get song() {
    return this.queue[0];
  }

  add(item) {
    this.queue.push(item);
  }

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
