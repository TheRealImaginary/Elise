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
      args: [{
        key: 'ally',
        prompt: 'Which member do you want me to mute ?',
        type: 'member',
      }],
      guildOnly: true,
    });
  }

  hasPermissions(member) {
    return member.permissions.has('MUTE_MEMBERS');
  }

  async run(message, { ally }) {
    if (this.hasPermissions(message.member)) {
      if (ally.serverDeaf || ally.serverMute) {
        await ally.setMute(false);
        message.say(`Rejoice ${ally.displayName}, for ${message.member.displayName} has un-muted you !`);
      } else {
        message.say('Member is not Muted/Deafened');
      }
    } else {
      message.say('You don\'t have enough juice');
    }
  }
};
