const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const Meme = require('../../models/Meme');

module.exports = class MemeList extends Command {
  constructor(client) {
    super(client, {
      name: 'meme-list',
      aliases: ['list-meme', 'memes'],
      autoAliases: false,
      group: 'memes',
      memberName: 'meme-list',
      description: 'Shows the count of memes! Specify a page for content!',
      args: [{
        key: 'page',
        prompt: 'Which page would you like to view ?!',
        default: '0',
        type: 'integer',
      }],
    });
  }

  async run(message, { page }) {
    const [count, memes] = await Meme.findAndCount({}).catch(err => this.handleError(message, err));
    if (page > 0) {
      this.paginate(message, [count, memes], page);
    } else {
      message.say(`We currently have ${count} ${count > 1 ? 'Memes' : 'Meme'} !`);
    }
  }

  paginate(message, [count, memes], page) {
    if (count === 0 || count <= (page - 1) * 10) {
      message.say('We do not have that many memes !');
    } else {
      const currentPage = memes.slice((page - 1) * 10, page * 10);
      const memeList = currentPage.reduce((acc, meme, idx) => {
        acc += `⬧${idx + 1}. [${meme.name}](${meme.url}) - Uses: ${meme.uses}\n`;
        return acc;
      }, '');
      const embed = new RichEmbed();
      embed.setTitle('__**Memes**__');
      embed.setDescription(`Meme Page ${page}.`);
      embed.setColor('#FF0000');
      embed.addField('➤Songs', memeList);
      embed.setTimestamp(new Date());
      embed.setFooter(this.client.user.username, this.client.user.displayAvatarURL);
      message.embed(embed);
    }
  }

  handleError(message, error) {
    message.say('An Error Occured !');
    console.log('An Error Occured Counting/Viewing !');
    console.log(error);
  }
};
