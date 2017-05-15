const { Command } = require('discord.js-commando');

const musicQueue = require('../../util/music-queue');

module.exports = class Pause extends Command {
  constructor(client) {
    super(client, {
      name: 'pause',
      aliases: [],
      autoAliases: false,
      group: 'music',
      memberName: 'pause',
      description: 'Pauses the song currently playing !',
      guildOnly: true
    });
  }

  run(message) {
    const connection = musicQueue.connection;
    if (connection) {
      connection.dispatcher.pause();
      message.say(`${message.member.displayName} has paused the music !`);
    } else {
      message.say('We arenot playing any music !');
    }
  }
};
