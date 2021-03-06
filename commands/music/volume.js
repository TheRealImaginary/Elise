const { Command } = require('discord.js-commando');

module.exports = class Volume extends Command {
  constructor(client) {
    super(client, {
      name: 'volume',
      aliases: ['vol'],
      autoAliases: false,
      group: 'music',
      memberName: 'volume',
      description: 'Sets volume of music, either use +/- up/down or a number from 1-10. Leave empty to reset to default',
      guildOnly: true,
    });
  }

  run(message, args) {
    const connection = this.client.getMusicQueue(message.guild.id).connection;
    if (connection) {
      let newVolume = parseInt(args, 10);
      if (isNaN(newVolume)) {
        newVolume = connection.dispatcher.volume;
        if (args === 'up' || args === '+') {
          newVolume += 2;
        } else if (args === 'down' || args === '-') {
          newVolume -= 2;
        } else {
          newVolume = 1.25;
        }
      }
      if (newVolume > 10 || newVolume <= 0) {
        newVolume = connection.dispatcher.volume * 5;
      }
      connection.dispatcher.setVolumeLogarithmic(newVolume / 5);
    } else {
      message.say('We are not playing any music !');
    }
  }
};
