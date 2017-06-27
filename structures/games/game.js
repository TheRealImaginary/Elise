/* eslint-disable no-unused-vars */

/**
 * Represents a Game being played by a User.
 * @abstract
 */
module.exports = class Game {
  /**
   * Creates an instance of Game.
   * @param {Bot} client - Represents the Bot.
   * @param {User} player - Represents the Player.
   */
  constructor(client, player) {
    this.client = client;
    this.player = player;
    this.client.games.set(this.player.id, this);
  }

  /**
   * Plays the corresponding game.
   * @param {Message} - The Message that triggered the Game.
   */
  async play(message) {
    throw new TypeError(`${this.constructor.name} is not implementing a 'play' method !`);
  }

  /**
   * Awards the Player after winning the game.
   * @param {Message} - A Message associated with the Channel that the Game started in.
   */
  async award(message) {
    throw new TypeError(`${this.constructor.name} is not implementing an 'award' method !`);
  }

  /**
   * Ends the game.
   */
  endGame() {
    this.client.games.delete(this.player.id);
  }
};
