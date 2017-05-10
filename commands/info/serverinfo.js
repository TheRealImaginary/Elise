const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');

module.exports = class ServerInfo extends Command {
  constructor(client) {
    super(client, {
      name: 'serverinfo',
      aliases: ['guildinfo', 'guild', 'server'],
      autoAliases: false,
      group: 'info',
      memberName: 'serverinfo',
      description: 'Displays Server\'s Info',
      guildOnly: true
    });
  }

  run(message) {
    const guildInfo = this.getServerInfo(message.guild);
    if (guildInfo) {
      message.embed(guildInfo);
    } else {
      message.say('An Error Occured Fetching Server\'s Info! :(');
    }
  }

  getServerInfo(guild) {
    if (guild.available) {
      const embed = new RichEmbed();
      const channels = guild.channels;
      const voiceChannels = channels.filter(vc => vc.type === 'voice');
      const textChannels = channels.filter(tc => tc.type === 'text');

      embed.setThumbnail(guild.iconURL);
      embed.setTitle('__**Server Info**__');
      embed.setAuthor(guild.name, guild.iconURL);
      embed.addField('➤Channels',
        `⬧Voice Channels: ${voiceChannels.size}\n⬧Text Channels: ${textChannels.size}`);
      embed.addField('➤Members', `⬧Member Count: ${guild.memberCount}\n⬧Owner: ${guild.owner}`);
      embed.addField('➤Miscellaneous', `⬧Role Count: ${guild.roles.size}\n⬧Created At: ${guild.createdAt}\n⬧Location: ${guild.region}`);
      embed.setTimestamp(new Date());
      embed.setFooter(this.client.user.username, this.client.user.avatarURL);
      embed.setColor('#FF0000');
      return embed;
    }
  }
};
