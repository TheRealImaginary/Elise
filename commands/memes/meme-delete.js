const { Command } = require('discord.js-commando');
const Meme = require('../../models/Meme');

// For now Meme Owners or Bot Owner can delete the Meme.
module.exports = class MemeDelete extends Command {
  constructor(client) {
    super(client, {
      name: 'meme-delete',
      aliases: ['delete-meme'],
      autoAliases: false,
      group: 'memes',
      memberName: 'meme-delete',
      description: `Delete a meme. Only the one who created the meme can delete it. However, The Bot Owner
                    or Server Admins are exceptions.`,
      args: [{
        key: 'name',
        prompt: 'What is the name of the Meme you want to purge ?!',
        type: 'string',
      }],
    });
  }

  run(message, { name }) {
    Meme.findThenRemove(name, message.author)
      .then(() => message.say('Successfully Deleted Meme !'))
      .catch((err) => {
        if (err.name && (err.name === 'NoExists' || err.name === 'NotCreator')) {
          message.say(err.message);
        } else {
          message.say('An Error Occured Deleting the Meme !');
          this.client.emit('error', err);
        }
      });
  }
};
