const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');

module.exports = class Queue extends Command {
  constructor(client) {
    super(client, {
      name: 'queue',
      aliases: [],
      autoAliases: false,
      group: 'music',
      memberName: 'queue',
      description: 'Shows the current queue',
      args: [{
        key: 'page',
        prompt: 'Which page do you want to view ?!',
        default: '0',
        type: 'integer'
      }],
      guildOnly: true
    });
  }

  run(message, { page }) {
    const queue = this.client.getMusicQueue(message.guild.id).queue;
    if (page > 0) {
      this.paginate(message, queue, page);
    } else {
      const queueSize = queue.length;
      message.say(`We have ${queueSize} ${queueSize > 1 ? 'songs' : 'song'} in the queue !`);
    }
  }

  paginate(message, queue, page) {
    const queueSize = queue.length;
    if (queueSize === 0 || queueSize <= (page - 1) * 10) {
      message.say('We do not have that many songs !');
    } else {
      const currentPage = queue.slice((page - 1) * 10, page * 10);
      const songList = currentPage.reduce((acc, video, idx) => {
        acc += `⬧${idx + 1}. [${video.title}](${video.url}) - ${video.duration}\n`;
        return acc;
      }, '');
      const embed = new RichEmbed();
      embed.setTitle('__**Queue**__');
      embed.setDescription(`Queue Page ${page}.`);
      embed.addField('➤Songs', songList);
      embed.setFooter(this.client.user.username, this.client.user.avatarURL);
      embed.setTimestamp(new Date());
      embed.setColor('#FF0000');
      message.embed(embed);
    }
  }
};
