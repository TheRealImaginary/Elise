const moment = require('moment');
const winston = require('winston');
const Youtube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const { Command } = require('discord.js-commando');

const MusicQueue = require('../../structures/MusicQueue');
const Song = require('../../structures/Song');

const api = new Youtube(process.env.YOUTUBE_KEY);

const { MAX_QUEUE_SIZE, MAX_SONG_DURATION } = process.env;

module.exports = class Play extends Command {
  constructor(client) {
    super(client, {
      name: 'play',
      aliases: [],
      autoAliases: false,
      group: 'music',
      memberName: 'play',
      description: 'Plays or enqueues a music from YouTube',
      args: [{
        key: 'song',
        label: 'link/name',
        prompt: 'What would you like to listen to ?',
        type: 'string',
      }],
      guildOnly: true,
    });
  }

  async run(message, { song }) {
    if (!message.member.voiceChannel) {
      message.reply('You need to be in a voice channel !');
      return;
    }
    const musicQueue = this.client.queues.get(message.guild.id)
      || new MusicQueue(MAX_QUEUE_SIZE);
    if (message.member.voiceChannel && (musicQueue.connection
      && musicQueue.connection.channel.id !== message.member.voiceChannel.id)) {
      message.reply('Music is currently being played in a different Voice Channel !');
      return;
    }
    if (musicQueue.isFull) {
      message.reply('Current Queue is Full !');
      return;
    }
    const statusMessage = await message.say('Getting Video info...');
    try {
      const video = await api.getVideo(song);
      // Done !
      this.checkSong(video, message, statusMessage);
    } catch (error) {
      // Error, either song is a name or an error occured, so we try to search again.
      try {
        const result = (await api.searchVideos(song))[0];
        const video = await api.getVideoByID(result.id);
        // Done !
        this.checkSong(video, message, statusMessage);
      } catch (err) {
        this.client.emit('error', err);
        statusMessage.edit('Could not obtain the video info !');
      }
    }
  }

  checkSong(video, message, statusMessage) {
    if (video.durationSeconds === 0) {
      statusMessage.edit('Cannot play live videos !');
    } else if (video.durationSeconds > MAX_SONG_DURATION) {
      statusMessage.edit(`Cannot play songs with duration longer than ${
        moment.duration(MAX_SONG_DURATION, 'seconds').humanize()}`);
    } else {
      this.addSong(video, statusMessage, message);
    }
  }

  async addSong(video, statusMessage, { member, guild }) {
    let queue = this.client.queues.get(guild.id);
    if (!queue) {
      queue = new MusicQueue(MAX_QUEUE_SIZE);
      this.client.queues.set(guild.id, queue);
    }
    const song = new Song(video);
    queue.add(song);
    if (queue.length === 1) {
      statusMessage = await statusMessage.edit('Joining Your Channel... !');
      const connection = await member.voiceChannel.join();
      queue.connection = connection;
      this.play(song, statusMessage);
    }
  }

  async play(song, statusMessage, guild) {
    const queue = this.client.queues.get(guild.id);
    if (!song) {
      statusMessage.edit('We ran out of songs !');
      queue.disconnect();
      return;
    }
    try {
      const connection = queue.connection;
      statusMessage = await statusMessage.edit('Downloading Song... !');
      const stream = ytdl(song.url, { quality: 'lowest', filter: 'audioonly' });

      let downloadError = false;

      stream.once('response', () => {
        winston.info('[ELISE]: Response');
        statusMessage.edit('', { embed: song.info });
      }).on('error', (err) => {
        downloadError = true;
        this.client.emit('error', err);
        statusMessage.edit('An Error Occured downloading the video ! :(');
      }).once('end', () => {
        winston.info('[ELISE]: Finished Downloading !');
      });

      const dispatcher = connection.playStream(stream);
      dispatcher.setVolumeLogarithmic(0.25);

      dispatcher.on('error', (err) => {
        if (downloadError) {
          return;
        }
        this.client.emit('error', err);
        statusMessage.edit('An Error Occured playing song ! :(');
      }).once('end', async (reason) => {
        if (reason) {
          winston.info(`[ELISE]: Stream Ended because of ${reason}`);
          statusMessage = await statusMessage.channel.send('Shifting Queue... !');
          queue.shift();
          this.play(guild, statusMessage, queue.first);
        }
      });
    } catch (err) {
      this.client.emit('error', err);
      statusMessage.edit('Error Occured Downloading Video !');
    }
  }
};
