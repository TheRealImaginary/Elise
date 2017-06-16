const { Command } = require('discord.js-commando');
const Vote = require('../../structures/vote');

module.exports = class Skip extends Command {
  constructor(client) {
    super(client, {
      name: 'skip',
      aliases: [],
      autoAliases: false,
      group: 'music',
      memberName: 'skip',
      description: `Skips Music if 3 members or less are in channel, otherwise starts a vote, skips when 
                    more than half the participants votes positively. Voting phase lasts for 10 seconds.`,
      guildOnly: true,
    });

    this.votes = new Map();
  }

  run(message) {
    const queue = this.client.getMusicQueue(message.guild.id);
    if (!queue.connection) {
      message.say('We are not playing any music now !');
      return;
    }
    const memberCount = queue.connection.channel.members.size - 1; // Don't include the bot.
    if (memberCount <= 3) {
      queue.connection.dispatcher.end('Skipping a Song');
    } else {
      const votes = this.getVotes(message, message.guild.id);
      if (votes.vote(message.member.id)) {
        message.say(`${votes.size}/${memberCount} votes to skip !`);
      } else {
        message.say('You already voted mister !');
      }
    }
  }

  getVotes(message, guildID) {
    if (!this.votes.has(guildID)) {
      const options = {
        done: () => {
          const queue = this.client.getMusicQueue(guildID);
          if (queue.connection && queue.connection.dispatcher) {
            const memberCount = queue.connection.channel.members.size - 1;
            const voteCount = this.votes.get(guildID).size;
            if (voteCount > memberCount / 2) {
              message.say('Skipping a song !');
              queue.connection.dispatcher.end('Skipping a Song!');
            } else {
              message.say('We needed more votes !');
            }
          }
          this.votes.delete(guildID);
        },
        duration: 10000,
      };
      this.votes.set(guildID, new Vote(options));
    }
    return this.votes.get(guildID);
  }
};
