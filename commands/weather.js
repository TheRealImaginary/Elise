/*yahoo, normal*/
const http = require('http');
var config;
try {
	config = require('./config.json');
} catch (err) {
	config = {};
	console.log('Weather Couldn\'t find config.');
	//console.log(err);
}

const API_ID = process.env.WEATHER_API || config.WEATHER_API;

var getWeather = function(city, callBack) {
	var options = {
		protocol: 'http:',
		host: 'api.openweathermap.org',
		path: `/data/2.5/weather?q=${city}&units=metric&appid=${API_ID}`,
		port: 80,
		method: 'GET'
	};

	var request = http.request(options, function(response) {

		response.on('data', function(data) {
			console.log(JSON.parse(data));
			callBack(response.statusCode, JSON.parse(data));
		});

	});

	request.end();
};

module.exports = getWeather;