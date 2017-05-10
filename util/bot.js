const { Client } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');

module.exports = class Bot extends Client {
  constructor(options) {
    super(options);

    Object.defineProperty(this, 'trivia', { value: 'false' });

    Object.defineProperty(this, 'commandsExecuted', { value: '0' });
  }

  get status() {
    const embed = new RichEmbed();
    const uptime = this.uptime;
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = (uptime % 3600) % 60;
    const memoryUsed = process.memoryUsage().heapUsed;
    embed.setThumbnail(this.user.avatarURL);
    embed.setTitle('__**Bot Status**__');
    embed.addField('➤Uptime', `⬧Hours: ${hours}\n⬧Minutes: ${minutes}\n⬧Seconds: ${seconds}`);
    embed.addField('➤Memory Usage', `⬧Memory Used: ${Math.floor(memoryUsed / (1024 * 1024))} MB`);
    embed.addField('➤Misc', `⬧Commands Executed: ${this.commandsExecuted}`);
    embed.setColor('#FF0000');
    embed.setTimestamp(new Date());
    embed.setFooter(this.user.username, this.user.avatarURL);
    return embed;
  }
};
