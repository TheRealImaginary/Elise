const { Command } = require('discord.js-commando');
const Tag = require('../../models/Tag');

module.exports = class TagDelete extends Command {
  constructor(client) {
    super(client, {
      name: 'delete-tag',
      aliases: ['del-tag', 'tag-del', 'd-tag', 'tag-d'],
      group: 'tags',
      memberName: 'delete-tag',
      description: 'Deletes a Tag with the given name if it exists !',
      args: [{
        key: 'name',
        prompt: 'What is the name of the Tag you which to delete ?!',
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

  hasPermissions(message) {
    return this.client.isOwner(message.author) || message.member.hasPermissions('ADMINISTRATOR');
  }

  async run(message, { name }) {
    const hasPermissions = this.hasPermission(message);
    const tag = await Tag.findOne({ name, guildID: message.guild.id }).exec();
    if (!tag) {
      message.reply(`No Tag with the name ${name} was found !`);
      return;
    }
    if (tag.addedBy === message.author.id || hasPermissions) {
      await tag.remove();
      message.reply(`Tag ${name} has been removed !`);
    } else {
      message.reply('You can only delete Tags that you created, unless you are a Server Admin !');
    }
  }
};
