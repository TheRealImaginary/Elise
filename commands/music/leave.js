const { Command } = require('discord.js-commando');

const musicQueue = require('../../util/music-queue');

module.exports = class Leave extends Command {
  constructor(client) {
    super(client, {
      name: 'leave',
      aliases: [],
      autoAliases: false,
      group: 'music',
      memberName: 'leave',
      description: 'Bot will leave the Voice Channel'
    });
  }

  hasPermissions(user) {
    return this.client.isOwner(user);
  }

  run(message) {
    if (this.hasPermissions(message.author)) {
      if (!musicQueue.disconnect()) {
        message.say('We are not playing any music !');
      }
    } else {
      message.say('You don\'t have enough juice');
    }
  }
};
