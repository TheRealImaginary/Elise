/*yahoo, normal*/
var http = require('http');
const API_ID = process.env.weather_api;

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