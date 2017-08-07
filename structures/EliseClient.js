const { Client } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const dataBase = require('./Database');
const redis = require('./Redis');
const ScoreBoard = require('./games/Scoreboard');

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
     * Games for each User.
     * @type {Map<string,Game>}
     */
    this.games = new Map();

    /**
     * Games for each Guild.
     * This is intended for Games that multiple Users can join.
     * @type {Map<string, Game>}
     */
    this.guildGames = new Map();

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
