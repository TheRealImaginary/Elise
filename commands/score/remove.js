const { Command } = require('discord.js-commando');

module.exports = class Add extends Command {
  constructor(client) {
    super(client, {
      name: 'remove',
      aliases: [],
      autoAliases: false,
      group: 'score',
      memberName: 'remove',
      description: 'Removes a specific amount of score from a user.',
      args: [{
        key: 'user',
        prompt: 'Who would you like to take kittens from ?',
        type: 'user',
      }, {
        key: 'kittens',
        prompt: 'How many kittens would you like to take from your friend ?!',
        type: 'integer',
      }],
      guildOnly: true,
    });
  }

  hasPermission(message) {
    return this.client.isOwner(message.author);
  }

  run(message, { user, kittens }) {
    this.client.scoreboard.penalize(user.id, kittens);
    message.reply(`Successfully took ${kittens} ${kittens === 1 ? 'kitten' : 'kittens'} from ${user.tag}.`);
  }
};
