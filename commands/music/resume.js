const { Command } = require('discord.js-commando');

const musicQueue = require('../../util/music-queue');

module.exports = class Resume extends Command {
  constructor(client) {
    super(client, {
      name: 'resume',
      aliases: [],
      autoAliases: false,
      group: 'music',
      memberName: 'resume',
      description: 'Resumes the music if any !',
      guildOnly: true
    });
  }

  run(message) {
    const connection = musicQueue.connection;
    if (connection) {
      if (connection.dispatcher.paused) {
        connection.dispatcher.resume();
      } else {
        message.say('Song is not paused !');
      }
    } else {
      message.say('We arenot playing any music !');
    }
  }
};
