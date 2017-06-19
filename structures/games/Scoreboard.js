const User = require('../../models/User');

module.exports = class Scoreboard {
  constructor(client) {
    /**
     * Represents The Client.
     * @type {Bot}
     */
    this.client = client.redis.client;

    /**
     * Refresh Rate at which we will persist what is cached
     * in the Memory to the Database
     * @type {number}
     */
    this.refreshRate = process.env.REFRESH_RATE * 60 * 1000;
  }

  /**
   * Awards the User with points.
   * @param {User} user - The User to reward.
   * @param {number} points - The Points to reward the user with.
   */
  async award(user, points) {
    const result = await this.client.hgetAsync('scoreboard', user.id) || 0;
    await this.client.hsetAsync('scoreboard', user.id, parseInt(result, 10) + points);
  }
};
