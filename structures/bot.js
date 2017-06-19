const { Client } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const dataBase = require('./Database');
const redis = require('./Redis');
const ScoreBoard = require('./games/Scoreboard');
const MusicQueue = require('./music-queue');

module.exports = class Bot extends Client {
  constructor(options) {
    super(options);

    /**
     * Database.
     */
    this.db = dataBase;
    this.db.connect();

    /**
     * Redis Server.
     */
    this.redis = redis;
    this.redis.connect();

    /**
     * Music Queues for each guild.
     * @type {Map<string, MusicQueue>}
     */
    this.queues = new Map();

    /**
     * Games for each player.
     * @type {Map<string,Game>}
     */
    this.games = new Map();

    /**
     * How Many times a command has been executed.
     * @type {number}
     */
    this.commandsExecuted = 0;

    /**
     * Scoreboard for Awarding and Displaying Scores.
     * @type {Scoreboard}
     */
    this.scoreboard = new ScoreBoard(this);

    this.on('commandRun', () => {
      this.commandsExecuted += 1;
    });

    this.on('ready', () => {
      this.scoreboard.award(this.owners[0], 300);
    });
  }
  /**
   * Check whether the Member is in the channel where the music is playing or no.
   * @param {GuildMember} member - GuildMember.
   * @param {Guild} guild - Guild.
   * @returns {boolean} True if Member and Bot are in same
   * Channel in this Guild or Bot is in no Channel.
   */
  checkMusicQueue(member, guild) {
    const queue = this.queues.get(guild);
    return (queue && queue.connection && queue.isPlaying &&
      queue.connection.channel.members.has(member.id)) || (member.voiceChannel);
  }

  /**
   * Add a Song to Guild's Music Queue, Creating one if necessary.
   * @param {Guild} guild - Guild.
   * @param {object} song - Song.
   * @returns {boolean} Whether addition was successful or no.
   */
  addToQueue(guild, song) {
    if (!this.queues.has(guild)) {
      this.queues.set(guild, new MusicQueue());
    }
    return this.queues.get(guild).add(song);
  }

  /**
   * Checks whether music is playing in a Guild.
   * @param {Guild} guild - Guild.
   * @returns True is Music is playing, False Otherwise.
   */
  isMusicPlaying(guild) {
    return this.queues.get(guild).isPlaying;
  }

  /**
   * Sets the Music Status of this guild.
   * @param {any} guild - Guild.
   * @param {boolean} status - Status.
   */
  setMusicStatus(guild, status) {
    this.queues.get(guild).isPlaying = status;
  }

  /**
   * Retreives the Music Queue.
   * @param {Guild} guild - Guild.
   * @returns {MusicQueue} The Music Queue.
   */
  getMusicQueue(guild) {
    if (!this.queues.has(guild)) {
      this.queues.set(guild, new MusicQueue());
    }
    return this.queues.get(guild);
  }

  /**
   * Computes and Returns the Status Of the Bot.
   * @type {RichEmbed}
   * @readonly
   */
  get status() {
    const embed = new RichEmbed();
    const uptime = Math.floor(this.uptime / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = (uptime % 3600) % 60;
    const memoryUsed = process.memoryUsage().heapUsed;
    embed.setThumbnail(this.user.displayAvatarURL);
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
