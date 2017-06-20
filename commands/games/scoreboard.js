const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const User = require('../../models/User');

module.exports = class Scoreboard extends Command {
  constructor(client) {
    super(client, {
      name: 'scoreboard',
      aliases: ['leaderboard', 'scoretop', 'kitties'],
      autoAliases: false,
      group: 'games',
      memberName: 'scoreboard',
      description: 'Displays the top 5 Scores !',
    });
  }

  async run(message) {
    const scoreboard = await this.getCached();
    const embed = new RichEmbed();
    embed.setTitle('**__Kittens Scoreboard Top 5__**');
    embed.setDescription(scoreboard.join('\n'));
    embed.setColor('RANDOM');
    embed.setTimestamp(new Date());
    embed.setFooter(this.client.user.username, this.client.user.avatarURL());
    message.embed(embed);
  }

  async getCached() {
    let cached = await this.client.scoreboard.getAll();
    if (cached) {
      const keys = Object.keys(cached);
      cached = await Promise.all(keys
        .map(async key =>
          ({ userName: (await this.client.fetchUser(key)).username, points: cached[key] })));
      cached.sort((a, b) => b.points - a.points);
      return cached.splice(0, 5)
        .map((el, index) => `${index + 1}. ${el.userName} - ${el.points} Kittens`);
    }
    const users = await User.find({}).exec();
    users.sort((a, b) => b.points - a.points);
    return users.splice(0, 5).map((el, index) => `${index + 1}. ${el.userName} - ${el.points} Kittens`);
  }
};
