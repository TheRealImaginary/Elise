const axios = require('axios');
const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');

const API_ID = process.env.WEATHER_API;

module.exports = class Weather extends Command {
  constructor(client) {
    super(client, {
      name: 'weather',
      aliases: [],
      autoAliases: false,
      group: 'weather',
      memberName: 'weather',
      description: 'Displays Weather at a chosen city',
      args: [{
        key: 'city',
        prompt: 'What city would you like to know the weather in ?',
        type: 'string'
      }],
      throttling: {
        usages: 2,
        duration: 5
      }
    });
  }

  async run(message, args) {
    let weather;
    try {
      weather = await this.getWeather(args);
      weather = this.getData(weather);
      if (weather) {
        message.embed(weather);
      } else {
        message.say('An Error Occured Fetching Weather Data! :(');
      }
    } catch (err) {
      message.say('An Error Occured Fetching Weather Data! :(');
    }
  }

  getWeather({ city }) {
    return axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_ID}`);
  }

  getData({ data }) {
    if (data) {
      const embed = new RichEmbed();
      const weather = data.weather[0];
      const main = data.main;
      const sys = data.sys;

      embed.setTitle('__**Weather Info**__');
      embed.addField('➤Info', `⬧Status: ${weather.main}\n⬧Description: ${weather.description}\n⬧Temperature: ${main.temp} Celsius\n⬧Pressure: ${main.pressure} hPa`);
      embed.addField('➤Miscellaneous', `⬧Location: ${data.name},${sys.country}\n⬧Sunrise: ${new Date(sys.sunrise * 1000)}\n⬧Sunset: ${new Date(sys.sunset * 1000)}`);
      embed.setColor('#FF0000');
      embed.setTimestamp(new Date());
      embed.setFooter(this.client.user.username, this.client.user.avatarURL);
      return embed;
    }
    return null;
  }
};
