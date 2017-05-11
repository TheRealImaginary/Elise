const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');

module.exports = class MemberInfo extends Command {
  constructor(client) {
    super(client, {
      name: 'memberinfo',
      aliases: [],
      autoAliases: false,
      group: 'info',
      memberName: 'memberinfo',
      description: 'Displays Member\'s Info',
      args: [{
        key: 'member',
        prompt: 'Which member do you want to know more about ?',
        type: 'member'
      }],
      guildOnly: true
    });
  }

  run(message, { member }) {
    const memberInfo = this.getMemberInfo(member);
    if (memberInfo) {
      message.embed(memberInfo);
    } else {
      message.say('An Error Occured Fetching Member\'s Info! :(');
    }
  }

  getMemberInfo(member) {
    if (member) {
      const embed = new RichEmbed();
      const presence = member.user.presence;
      embed.setThumbnail(member.user.avatarURL);
      embed.setTitle('__**Member Info**__');
      embed.setAuthor(member.user.username, member.user.avatarURL);
      embed.addField('➤Member', `⬧Nickname: ${member.nickname || 'None'}\n⬧Joined On: ${member.joinedAt}\n⬧Roles: ${member.roles.size}`);
      embed.addField('➤User', `⬧Created On: ${member.user.createdAt}\n⬧Status: ${presence.status}\n⬧Game: ${presence.game ? presence.game.name : 'None'}\n⬧Intelligent: ${member.user.bot ? 'Not Yet!' : 'Yes'}`);
      embed.setTimestamp(new Date());
      embed.setFooter(this.client.user.username, this.client.user.avatarURL);
      embed.setColor('#FF0000');
      return embed;
    }
  }
};
