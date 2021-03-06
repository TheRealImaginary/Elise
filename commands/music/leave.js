const { Command } = require('discord.js-commando');

module.exports = class Leave extends Command {
  constructor(client) {
    super(client, {
      name: 'leave',
      aliases: ['stop', 'stahp'],
      autoAliases: false,
      group: 'music',
      memberName: 'leave',
      description: 'Bot will leave the Voice Channel. Only Bot Owner can use this command !',
    });
  }

  hasPermissions(user) {
    return this.client.isOwner(user);
  }

  run(message) {
    if (this.hasPermissions(message.author)) {
      if (!this.client.getMusicQueue(message.guild.id).disconnect()) {
        message.say('We are not playing any music !');
      }
    } else {
      message.say('You don\'t have enough juice');
    }
  }
};
