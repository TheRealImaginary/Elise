const { Command } = require('discord.js-commando');

module.exports = class UnMute extends Command {
  constructor(client) {
    super(client, {
      name: 'unmute',
      aliases: [],
      autoAliases: false,
      group: 'mod',
      memberName: 'unmute',
      description: 'Mutes a member from speaking in voice channels',
      guildOnly: true
    });
  }

  run(message) {
    message.say('In Progress');
  }
};
