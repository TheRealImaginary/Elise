const moment = require('moment');
const Youtube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');

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
        type: 'string',
      }],
      guildOnly: true,
    });
  }

  async run(message, { song }) {
    if (this.client.checkMusicQueue(message.member, message.guild)) {
      const statusMessage = await message.say('Getting Video Info... !');
      // We can allow index
      if (/channel/.test(song) || /playlist/.test(song) || /index/.test(song)) {
        statusMessage.edit('You can only use videoes ! Playlists and Channels are not allowed !');
        return;
      }
      try {
        if (youtubeRegex.test(song)) {
          const video = await this.getVideo(message.author, song);
          this.addToQueue(message, statusMessage, video);
        } else if (!/youtube.com/.test(song)) {
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
        .then((video) => {
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

  async addToQueue({ guild, member }, statusMessage, video) {
    const guildID = guild.id;
    if (!this.client.addToQueue(guildID, video)) {
      // statusMessage.edit('Queue is at maximum capacity !');
      statusMessage.edit('Either the queue is full or you are trying to add a song more than once !');
      return;
    }
    if (!this.client.isMusicPlaying(guildID)) {
      this.client.setMusicStatus(guildID, true);
      try {
        statusMessage = await statusMessage.edit('Joining Your Channel... !');
        console.log(member.voiceChannel.name);
        const connection = await member.voiceChannel.join();
        this.client.getMusicQueue(guildID).connection = connection;
        this.play(guildID, statusMessage, video);
      } catch (err) {
        console.log(err);
        statusMessage.edit('An Error Occured Joining your channel !');
      }
      return;
    }
    statusMessage.edit('Added Song to queue !');
  }

  async play(guild, statusMessage, video) {
    if (!video) {
      statusMessage.edit('We have ran out of songs !');
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
        statusMessage.edit('', { embed: this.nowPlaying(video) });
      });
      stream.on('error', (err) => {
        console.log('An Error Occured while downloading !');
        console.log(err);
        statusMessage.edit('An Error Occured downloading the video ! :(');
      });
      stream.on('end', () => {
        console.log('Finished!');
      });
      const dispatcher = connection.playStream(stream);
      dispatcher.setVolumeLogarithmic(0.25);
      dispatcher.on('error', (err) => {
        console.log('An Error Occured playing song !');
        console.log(err);
        statusMessage.edit('An Error Occured playing song ! :(');
      });

      dispatcher.on('end', async (reason) => {
        if (reason) {
          console.log(`Stream Ended because of ${reason}`);
          statusMessage = await statusMessage.channel.send('Shifting Queue... !');
          queue.shift();
          this.play(guild, statusMessage, queue.song);
        }
      });
    } catch (err) {
      console.log(err);
      statusMessage.edit('Error Occured Downloading Video !');
    }
  }

  nowPlaying(video) {
    const embed = new RichEmbed();
    embed.setThumbnail(video.thumbnail);
    embed.setTitle('__**Now Playing**__');
    embed.addField('➤Details', `⬧[${video.title}](${video.url})\n⬧${video.duration}`);
    embed.setColor('#FF0000');
    embed.setAuthor(video.addedBy.author, video.addedBy.avatar);
    embed.setFooter(this.client.user.username, this.client.user.displayAvatarURL);
    embed.setTimestamp(new Date());
    return embed;
  }

  normalize(user, video) {
    return {
      url: video.url,
      title: video.title,
      duration: moment.duration(video.durationSeconds, 'seconds').humanize(),
      thumbnail: `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`,
      addedBy: {
        author: user.tag,
        avatar: user.displayAvatarURL,
      },
    };
  }
};
