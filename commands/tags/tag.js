const { Command } = require('discord.js-commando');
const Tag = require('../../models/Tag');

module.exports = class TagCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'tag',
      aliases: [],
      autoAliases: false,
      group: 'tags',
      memberName: 'tag',
      description: `Fetches a Tag with the given name if it exists. Otherwise the name will be used
      as a \`relatedTo\`and a list of related Tags will be returned if any`,
      args: [{
        key: 'name',
        prompt: 'What is the name of the Tag you want me to fetch ?',
        type: 'string',
        parse: value => value.toLowerCase(),
      }],
      throttling: {
        usages: 2,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  async run(message, { name }) {
    const tag = await Tag.findOne({ name, guildID: message.guild.id }).exec();
    if (tag) {
      message.say(tag.content);
    } else {
      const regex = new RegExp(name, 'gi');
      let relatedTags = await Tag
        .find({ guildID: message.guild.id }).or([{ name: regex }, { relatedTo: regex }]).exec();
      if (relatedTags && relatedTags.length > 0) {
        relatedTags = relatedTags.map(t => `**${t.name}**`).join(', ');
        message.reply(`No Tag with the name ${name} was found ! Did you mean any of ${relatedTags} !`);
      } else {
        message.reply(`No Tag with the name ${name} was found !`);
      }
    }
  }
};
