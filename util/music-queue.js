const queue = [];
let connection;

module.exports = class MusicQueue {
  constructor() {
    throw new Error(`${this.constructor.name} cannot be instantiated !`);
  }

  static shift() {
    queue.shift();
  }

  static getQueue() {
    return queue;
  }

  static add(item) {
    queue.push(item);
  }

  static get song() {
    return queue[0];
  }

  static get connection() {
    return connection;
  }

  static disconnect() {
    if (connection) {
      connection.channel.leave();
      connection = null;
      return true;
    }
    return false;
  }

  static connect(voiceConnection) {
    connection = voiceConnection;
  }
};
