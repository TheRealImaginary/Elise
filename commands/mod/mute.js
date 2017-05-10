const { Command } = require('discord.js-commando');

module.exports = class Mute extends Command {
  constructor(client) {
    super(client, {
      name: 'mute',
      aliases: [],
      autoAliases: false,
      group: 'mod',
      memberName: 'mute',
      description: 'Mutes a member from speaking in voice channels',
      guildOnly: true
    });
  }

  run(message) {
    message.say('In Progress');
  }
};
