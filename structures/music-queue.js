const MAX_QUEUE_SIZE = parseInt(process.env.MAX_QUEUE_SIZE, 10);

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
    if (this.queue.length === MAX_QUEUE_SIZE) {
      return false;
    } else if (this.queue.filter(song => song.title === item.title
      || song.url === item.url).length > 0) {
      return false;
    }
    this.queue.push(item);
    return true;
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
