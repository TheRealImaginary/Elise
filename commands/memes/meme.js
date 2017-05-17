const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const Meme = require('../../models/Meme');

module.exports = class MemeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'meme',
      aliases: [],
      autoAliases: false,
      group: 'memes',
      memberName: 'meme',
      description: 'Views a meme with a specific name !',
      args: [{
        key: 'name',
        prompt: 'Which meme would you like to use ?!',
        type: 'string',
      }],
    });
  }

  run(message, { name }) {
    Meme.findOne({ name })
      .exec()
      .then((meme) => {
        if (meme) {
          message.embed(this.createMeme(message.author, meme));
          meme.use();
        } else {
          message.say('No such meme exists, Maybe you can save one ?!');
        }
      })
      .catch((err) => {
        message.say('An Error Occured trying to fetch that meme !');
        console.log('Mongoose Error Saving Meme !');
        console.log(err);
      });
  }

  createMeme(author, meme) {
    const embed = new RichEmbed();
    embed.setAuthor(author.username, author.displayAvatarURL);
    embed.setImage(meme.url);
    embed.setColor('#FF0000');
    embed.setFooter(this.client.user.username, this.client.user.displayAvatarURL);
    embed.setTimestamp(new Date());
    return embed;
  }
};
