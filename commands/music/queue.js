const { Command } = require('discord.js-commando');

const musicQueue = require('../../util/music-queue');

module.exports = class Queue extends Command {
  constructor(client) {
    super(client, {
      name: 'queue',
      aliases: [],
      autoAliases: false,
      group: 'music',
      memberName: 'queue',
      description: 'Shows the current queue',
      guildOnly: true
    });
  }

  run(message) {
    console.log(musicQueue.getQueue());
  }
};
