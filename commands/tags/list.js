const { Command } = require('discord.js-commando');
const Tag = require('../../models/Tag');

module.exports = class TagList extends Command {
  constructor(client) {
    super(client, {
      name: 'list-tag',
      aliases: ['tags-list', 't-list', 'list-t'],
      group: 'tags',
      memberName: 'list-tag',
      description: 'Lists all available Tag names in this guild !',
      throttling: {
        usages: 2,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  async run(message) {
    let tags = await Tag.find({ guildID: message.guild.id }).exec();
    if (!tags || tags.length === 0) {
      message.reply('We currently do not have any Tags. Why not add one ?!');
      return;
    }
    tags = tags.map(tag => `**${tag.name}**`).join(', ');
    message.say(`**__Guild Tags__**\n${tags}`);
  }
};
