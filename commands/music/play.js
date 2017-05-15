const moment = require('moment');
const Youtube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const { Command } = require('discord.js-commando');

const api = new Youtube(process.env.YOUTUBE_KEY);
const youtubeRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|\?v=)([^#&?]*).*/;

module.exports = class Play extends Command {
  constructor(client) {
    super(client, {
      name: 'play',
      aliases: [],
      autoAliases: false,
      group: 'music',
      memberName: 'play',
      description: 'Plays or enqueues music',
      args: [{
        key: 'song',
        prompt: 'What would you like to listen to ?',
        type: 'string'
      }],
      guildOnly: true
    });
  }

  async run(message, { song }) {
    if (message.member.voiceChannel || this.client.checkMusicQueue(message.member, message.guild)) {
      const statusMessage = await message.say('Getting Video Info... !');
      try {
        if (youtubeRegex.test(song)) {
          const video = await this.getVideo(message.author, song);
          this.addToQueue(message, statusMessage, video);
        } else {
          console.log(1);
          const video = await this.getVideoByName(message.author, song);
          this.addToQueue(message, statusMessage, video);
        }
      } catch (err) {
        if (err.name === 'Live') {
          statusMessage.edit(err.message);
        } else if (err.name === 'Too Long') {
          statusMessage.edit(err.message);
        } else {
          statusMessage.edit('An Error Occured Fetching Video Data !');
        }
      }
    } else {
      message.say('You need to be in a voice channel !');
    }
  }

  getVideo(user, song) {
    return new Promise((resolve, reject) => {
      api.getVideo(song)
        .then(video => {
          if (video.durationSeconds === 0) {
            const error = new Error('You cannot play live videos !');
            error.name = 'Live';
            reject(error);
          } else if (video.durationSeconds > 480) {
            const error = new Error('Video Duration is too long !');
            error.name = 'Too Long';
            reject(error);
          } else {
            resolve(this.normalize(user, video));
          }
        })
        .catch(reject);
    });
  }

  async getVideoByName(user, songName) {
    const result = (await api.searchVideos(songName, 1))[0];
    const video = await api.getVideoByID(result.id);
    return this.normalize(user, video);
  }

  async addToQueue(message, statusMessage, video) {
    const guild = message.guild.id;
    this.client.addToQueue(guild, video);
    if (!this.client.isMusicPlaying(guild)) {
      this.client.setMusicStatus(guild, true);
      try {
        statusMessage = await statusMessage.edit('Joining Your Channel... !');
        const connection = await message.member.voiceChannel.join();
        this.client.getMusicQueue(guild).connection = connection;
        this.play(guild, statusMessage, video);
      } catch (err) {
        console.log(err);
        statusMessage.edit('An Error Occured Joining your channel !');
      }
    } else {
      statusMessage.edit('Added Song to queue !');
    }
  }

  async play(guild, statusMessage, video) {
    if (!video) {
      this.client.getMusicQueue(guild).disconnect();
      return;
    }
    const queue = this.client.getMusicQueue(guild);
    try {
      const connection = queue.connection;
      console.log('Downloading Music.. !');
      statusMessage = await statusMessage.edit('Downloading Music... !');
      const stream = ytdl(video.url, { quality: 'lowest', filter: 'audioonly' });
      stream.on('response', async () => {
        console.log('Response');
        statusMessage = await statusMessage.edit('Playing music... !');
        statusMessage.delete(500);
      });
      stream.on('error', err => {
        console.log('An Error Occured while downloading !');
        console.log(err);
        statusMessage.edit('An Error Occured downloading the video ! :(');
      });
      stream.on('end', () => {
        console.log('Finished!');
      });
      const dispatcher = connection.playStream(stream);
      dispatcher.setVolumeLogarithmic(0.25);
      dispatcher.on('error', err => {
        console.log('An Error Occured playing song !');
        console.log(err);
        statusMessage.edit('An Error Occured playing song ! :(');
      });

      dispatcher.on('end', async reason => {
        console.log(`Stream Ended because of ${reason}`);
        statusMessage = await statusMessage.channel.send('Shifting Queue... !');
        queue.shift();
        this.play(guild, statusMessage, queue.song);
      });
    } catch (err) {
      console.log(err);
      statusMessage.edit('Error Occured Downloading Video !');
    }
  }

  normalize(user, video) {
    return {
      url: video.url,
      title: video.title,
      duration: moment.duration(video.durationSeconds, 'seconds').humanize(),
      thumbnail: `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`,
      addedBy: {
        author: user.tag,
        avatar: user.displayAvatarURL
      }
    };
  }
};
