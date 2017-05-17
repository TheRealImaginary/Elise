const { Command } = require('discord.js-commando');

module.exports = class Resume extends Command {
  constructor(client) {
    super(client, {
      name: 'resume',
      aliases: ['continue'],
      autoAliases: false,
      group: 'music',
      memberName: 'resume',
      description: 'Resumes the music if any !',
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  run(message) {
    const connection = this.client.getMusicQueue(message.guild.id).connection;
    if (connection) {
      if (connection.dispatcher.paused) {
        connection.dispatcher.resume();
        message.say(`${message.member.displayName} has resumed the music !`);
      } else {
        message.say('Song is not paused !');
      }
    } else {
      message.say('We arenot playing any music !');
    }
  }
};
