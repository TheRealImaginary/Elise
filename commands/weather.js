const request = require('request');
const RichEmbed = require('discord.js').RichEmbed;

let config;
try {
	config = require('../config.json');
} catch (err) {
	config = {};
	console.log('Weather Couldn\'t find config.');
}

const API_ID = process.env.WEATHER_API || config.WEATHER_API;

function getWeather(city, callBack) {

	let options = {
		url: `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_ID}`,
		method: 'GET',
		json: true
	}

	request(options, (err, response, body) => {
		if (err) {
			callBack(err, null);
		} else {
			callBack(null, body);
		}
	});
};

function getWeatherData(err, data, bot) {
	if (err || !data) {
		return 'Error getting weather data!';
	}
	var embed = new RichEmbed(),
		weather = data.weather[0],
		main = data.main,
		sys = data.sys;
	embed.setTitle('__**Weather Info**__');
	embed.addField('➤Info', `⬧Status: ${weather.main}\n⬧Description: ${weather.description}\n⬧Temperature: ${main.temp} Celsius\n⬧Pressure: ${main.pressure} hPa`);
	embed.addField('➤Miscellaneous', `⬧Country: ${sys.country}\n⬧Sunrise: ${new Date(sys.sunrise * 1000)}\n⬧Sunset: ${new Date(sys.sunset * 1000)}`);
	embed.setColor('#FF0000');
	embed.setTimestamp(new Date());
	embed.setFooter(bot.user.username, bot.user.avatarURL);
	return embed;
};

module.exports = {
	name: 'Weather',
	usage: `${PREFIX}weather <cityname>`,
	description: 'Use to get weather',
	hidden: false,
	executor(message, bot) {
		let cityName = message.content.split(' ')[1];
		if (!cityName || cityName === ' ' || cityName === '') {
			message.channel.sendMessage('Must Provoid me with a city name.');
			return;
		}
		getWeather(cityName, (err, data) => {
			var result = getWeatherData(err, data, bot);
			if (typeof result === 'string')
				message.channel.sendMessage(result);
			else
				message.channel.sendEmbed(result);
		});
	}
};