const { Command } = require('discord.js-commando');

module.exports = class Pause extends Command {
  constructor(client) {
    super(client, {
      name: 'pause',
      aliases: [],
      autoAliases: false,
      group: 'music',
      memberName: 'pause',
      description: 'Pauses the song currently playing !',
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  run(message) {
    const connection = this.client.queues.get(message.guild.id).connection;
    if (connection) {
      if (connection.dispatcher.paused) {
        message.say('Song is already paused');
      } else {
        connection.dispatcher.pause();
        message.say(`${message.member.user.tag} paused the music !`);
      }
    } else {
      message.say('We are not playing any music !');
    }
  }
};
