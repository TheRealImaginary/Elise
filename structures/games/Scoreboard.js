const winston = require('winston');
const User = require('../../models/User');

module.exports = class Scoreboard {
  constructor(client) {
    /**
     * Represents The Client.
     * @type {Bot}
     */
    this.client = client;

    /**
     * Represents The Redis Client.
     */
    this.redisClient = client.redis.client;

    /**
     * Refresh Rate at which we will persist what is cached
     * in the Memory to the Database
     * @type {number}
     */
    this.refreshRate = process.env.REFRESH_RATE * 60 * 1000;

    /**
     * The interval responsible for calling the save method
     * to save the Scoreboard to the Database.
     */
    this.interval = setInterval(this.saveScoreboard.bind(this), this.refreshRate);
  }

  /**
   * Awards the User with points.
   * @param {User} user - The User to reward.
   * @param {number} points - The Points to reward the user with.
   */
  async award(userID, points) {
    const result = await this.redisClient.hgetAsync('scoreboard', userID) || 0;
    await this.redisClient.hsetAsync('scoreboard', userID, parseInt(result, 10) + points);
    winston.info(`Awarding user ${userID}`);
  }

  /**
   * Fetches the Current Scoreboard.
   * @returns {Array<object>} An Array of UserIDs and Points.
   */
  getAll() {
    return this.redisClient.hgetallAsync('scoreboard');
  }

  /**
   * Saves the Scoreboard to the Database.
   */
  async saveScoreboard() {
    winston.info('[ELISE]: Saving Scoreboard...');
    const scoreboard = await this.getAll();
    const keys = Object.keys(scoreboard);
    keys.forEach(async (key) => {
      let user = await User.findOne({ userID: key }).exec();
      if (user) {
        user.points = parseInt(scoreboard[key], 10);
      } else {
        user = new User({
          userID: key,
          userName: (await this.client.fetchUser(key)).username,
          points: scoreboard[key],
        });
      }
      await user.save();
    });
    winston.info('[ELISE]: Scoreboard Saved !');
  }
};