/* eslint-disable no-unused-vars */

/**
 * Represents a Game being played by a User.
 * @abstract
 */
module.exports = class Game {
  constructor(client, player) {
    this.client = client;
    this.player = player;
  }

  /**
   * Plays the corresponding game.
   */
  play(message) {
    throw new TypeError(`${this.constructor.name} is not implementing play method !`);
  }

  /**
   * Ends the game.
   */
  endGame() {
    this.client.games.delete(this.player.id);
  }
};
