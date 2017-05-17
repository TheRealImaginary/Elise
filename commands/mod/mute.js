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
      args: [{
        key: 'victim',
        prompt: 'Which member do you want me to mute ?',
        type: 'member',
      }],
      guildOnly: true,
    });
  }

  hasPermissions(member) {
    return member.permissions.has('MUTE_MEMBERS');
  }

  async run(message, { victim }) {
    if (this.hasPermissions(message.member)) {
      if (victim.serverDeaf || victim.serverMute) {
        message.say('Member is already Muted/Deafened');
      } else {
        await victim.setMute(true);
        message.say(`${message.member.displayName} has muted ${victim.displayName}!`);
      }
    } else {
      message.say('You don\'t have enough juice');
    }
  }
};
