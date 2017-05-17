const { Client } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const dataBase = require('./database');
const MusicQueue = require('./music-queue');

module.exports = class Bot extends Client {
  constructor(options) {
    super(options);

    this.db = dataBase;
    this.db.connect();

    this.trivia = false;

    this.queues = new Map();

    this.commandsExecuted = 0;
  }

  checkMusicQueue(member, guild) {
    const queue = this.queues.get(guild);
    return (queue && queue.connection && queue.isPlaying &&
      queue.connection.channel.members.has(member.id)) || (member.voiceChannel);
  }

  addToQueue(guild, song) {
    if (!this.queues.has(guild)) {
      this.queues.set(guild, new MusicQueue());
    }
    console.log(this.queues.get(guild).queue);
    return this.queues.get(guild).add(song);
  }

  isMusicPlaying(guild) {
    return this.queues.get(guild).isPlaying;
  }

  setMusicStatus(guild, status) {
    this.queues.get(guild).isPlaying = status;
  }

  getMusicQueue(guild) {
    if (!this.queues.has(guild)) {
      this.queues.set(guild, new MusicQueue());
    }
    return this.queues.get(guild);
  }

  get status() {
    const embed = new RichEmbed();
    const uptime = Math.floor(this.uptime / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = (uptime % 3600) % 60;
    const memoryUsed = process.memoryUsage().heapUsed;
    embed.setThumbnail(this.user.avatarURL);
    embed.setTitle('__**Bot Status**__');
    embed.addField('➤Uptime', `⬧Hours: ${hours}\n⬧Minutes: ${minutes}\n⬧Seconds: ${seconds}`);
    embed.addField('➤Memory Usage', `⬧Memory Used: ${Math.floor(memoryUsed / (1024 * 1024))} MB`);
    embed.addField('➤Misc', `⬧Commands Executed: ${this.commandsExecuted}`);
    embed.setColor('#FF0000');
    embed.setTimestamp(new Date());
    embed.setFooter(this.user.username, this.user.displayAvatarURL);
    return embed;
  }
};
