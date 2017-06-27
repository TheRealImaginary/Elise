const moment = require('moment');
const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');

const Tag = require('../../models/Tag');

module.exports = class TagInfo extends Command {
  constructor(client) {
    super(client, {
      name: 'tag-info',
      aliases: ['info-tag', 'i-tag', 'tag-i'],
      group: 'tags',
      memberName: 'tag-info',
      description: 'Retrieve and Displays Tag\'s Name, Use Count, CreatedAt and User who created it !',
      args: [{
        key: 'name',
        prompt: 'What is the name of the Tag you want info on ?',
        type: 'string',
        parse: value => value.toLowerCase(),
      }],
      throttling: {
        usages: 2,
        duration: 3,
      },
      guildOnly: true,
    });
  }

  async run(message, { name }) {
    const tag = await Tag.findOne({ name, guildID: message.guild.id }).exec();
    if (!tag) {
      message.reply(`No Tag with the name ${name} was found !`);
      return;
    }
    const embed = await this.TagInfo(tag);
    message.embed(embed);
  }

  async TagInfo(tag) {
    const user = await this.client.fetchUser(tag.addedBy);
    const embed = new RichEmbed();
    embed.setColor('RANDOM');
    embed.setAuthor('Tag Info', user.displayAvatarURL());
    embed.addField('➤ User', `⬧ ${user.tag}`, true);
    embed.addField('➤ Tag Name', `⬧ ${tag.name}`, true);
    embed.addField('➤ Uses', `⬧ ${tag.uses}`, true);
    embed.addField('➤ Created At', `⬧ ${moment(tag.createdAt).format('ddd MMM Do YYYY hh:mm:ss A')}`);
    embed.setFooter(this.client.user.username, this.client.user.displayAvatarURL());
    return embed;
  }
};
