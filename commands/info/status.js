const { Command } = require('discord.js-commando');

module.exports = class Status extends Command {
  constructor(client) {
    super(client, {
      name: 'status',
      aliases: ['bot-status', 'elise-status', 'uptime'],
      autoAliases: false,
      group: 'info',
      memberName: 'status',
      description: 'Displays Bot Status!',
    });
  }

  run(message) {
    message.embed(this.client.status);
  }
};
