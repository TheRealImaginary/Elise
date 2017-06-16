
module.exports = class Vote {
  constructor(options) {
    /**
     * IDs of GuildMembers who voted.
     * @type {Set<string>}
     */
    this.voteID = new Set();

    /**
     * Timeout Object returned by `setTimeout`.
     * @type {object}
     */
    this.timeout = setTimeout(options.done, options.duration);
  }

  /**
   * Saves the Member's vote taking into account if he voted before.
   * @param {snowflak} memberID - GuildMember's ID.
   * @returns {boolean} True if member did not vote before, false otherwise.
   */
  vote(memberID) {
    if (this.voteID.has(memberID)) {
      return false;
    }
    this.voteID.add(memberID);
    return true;
  }

  /**
   * Returns the number of voters.
   * @type {number}
   * @readonly
   */
  get size() {
    return this.voteID.size;
  }
};
