const { Command } = require('discord.js-commando');

module.exports = class Leave extends Command {
  constructor(client) {
    super(client, {
      name: 'leave',
      aliases: ['stop', 'stahp'],
      autoAliases: false,
      group: 'music',
      memberName: 'leave',
      description: 'Bot will leave the Voice Channel. Only a Bot Owner or a Server Admin can use this command !',
      guildOnly: true,
    });
  }

  hasPermission(member) {
    return this.client.isOwner(member) || member.permissions.has('MOVE_MEMBERS');
  }

  run(message) {
    if (!this.client.queues.get(message.guild.id).disconnect()) {
      message.say('We are not playing any music !');
    } else {
      message.say('You don\'t have enough juice');
    }
  }
};
