const { Command } = require('discord.js-commando');
const Meme = require('../../models/Meme');

module.exports = class MemeAdd extends Command {
  constructor(client) {
    super(client, {
      name: 'meme-add',
      aliases: [],
      autoAliases: false,
      group: 'memes',
      memberName: 'meme-add',
      description: 'Adds a meme to the database',
      args: [{
        key: 'name',
        prompt: 'What would you like to name the meme ?!',
        type: 'string',
        min: 1
      }, {
        key: 'url',
        prompt: 'Where is your meme ?!',
        type: 'string',
        min: 1
      }]
    });
  }

  run(message, { name, url }) {
    new Meme({
      name,
      url,
      addedBy: message.author.id,
    }).save()
      .then(() => message.say('Meme has been registered !'))
      .catch(err => {
        if (err.code && err.code === 11000) {
          message.say('A Meme with the same name already exists !');
        } else {
          message.say('An Error Occured trying to save your meme !');
          console.log('Mongoose Error Saving Meme !');
          console.log(err);
        }
      });
  }
};
