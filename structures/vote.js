
module.exports = class Vote {
  constructor(options) {
    /**
     * IDs of GuildMembers who voted.
     * @type {Set<string>}
     */
    this.voteID = new Set();

    /**
     * Timeout Object returned by `setTimeout`.
     * @type {Object}
     */
    this.timeout = setTimeout(options.done, options.duration);
  }

  vote(memberID) {
    if (this.voteID.has(memberID)) {
      return false;
    }
    this.voteID.add(memberID);
    return true;
  }

  get size() {
    return this.voteID.size;
  }
};
