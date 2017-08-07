const moment = require('moment');
const { RichEmbed } = require('discord.js');

module.exports = class Song {
  constructor(video, user) {
    /**
     * Video's Title.
     * @type {string}
     */
    this.title = video.title;

    /**
     * Video's ID
     * @type {string}
     */
    this.id = video.id;

    /**
     * Video's URL
     * @type {string}
     */
    this.url = video.url;

    /**
     * Video's Duration.
     * @type {number}
     */
    this.duration = video.durationSeconds;

    /**
     * The Guild Member who added added the song.
     * @type {User}
     */
    this.addedBy = user;
  }

  /**
   * The duration of the Song.
   * @type {string}
   * @readonly
   */
  get time() {
    return moment.duration(this.duration, 'seconds').humanize();
  }

  get info() {
    return new RichEmbed()
      .setTitle('__**Now Playing**__')
      .addField('➤Details', `⬧[${this.title}](${this.url})\n⬧${this.time}`)
      .setColor('RANDOM')
      .setThumbnail(`https://img.youtube.com/vi/${this.id}/hqdefault.jpg`)
      .setAuthor(this.addedBy.tag, this.addedBy.displayAvatarURL)
      .setTimestamp(new Date());
  }
};
