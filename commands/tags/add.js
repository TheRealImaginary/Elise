const { Command } = require('discord.js-commando');
const Tag = require('../../models/Tag');

module.exports = class TagAdd extends Command {
  constructor(client) {
    super(client, {
      name: 'add-tag',
      aliases: [],
      group: 'tags',
      memberName: 'add-tag',
      description: `Adds a Tag with the given Name and Contents if one does not already exists !
      Markdown can be used !`,
      args: [{
        key: 'name',
        prompt: 'What would you like the Tag\'s name to be ?',
        type: 'string',
        parse: value => value.toLowerCase(),
      }, {
        key: 'content',
        prompt: 'What is the Tag\'s content ?',
        type: 'string',
        max: 1500,
      }],
      throttling: {
        usages: 2,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  // Message's Contents could have mentions, userID's ..etc, Should probably clean them !
  async run(message, { name, content }) {
    let tag = await Tag.findOne({ name, guildID: message.guildID }).exec();
    if (tag) {
      message.reply(`A Tag with the name ${name} already exists !`);
      return;
    }
    tag = new Tag({
      name,
      content,
      addedBy: message.author.id,
      guildID: message.guild.id,
    });

    await tag.save();

    message.reply(`A Tag with the name ${name} has been created !`);
  }
};
