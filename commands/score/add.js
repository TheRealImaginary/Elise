const { Command } = require('discord.js-commando');

module.exports = class Add extends Command {
  constructor(client) {
    super(client, {
      name: 'add',
      aliases: [],
      autoAliases: false,
      group: 'score',
      memberName: 'add',
      description: 'Gives the user a specific amount of score.',
      args: [{
        key: 'user',
        prompt: 'Who would you like to give kittens to ?',
        type: 'user',
      }, {
        key: 'kittens',
        prompt: 'How many kittens would you like to give your friend ?!',
        type: 'integer',
      }],
      guildOnly: true,
    });
  }

  hasPermission(message) {
    return this.client.isOwner(message.author);
  }

  run(message, { user, kittens }) {
    this.client.scoreboard.award(user.id, kittens);
    message.reply(`Successfully gave ${kittens} ${kittens === 1 ? 'kitten' : 'kittens'} to ${user.tag}.`);
  }
};
