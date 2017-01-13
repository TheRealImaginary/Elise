var http = require('http');
var xml2js = require('xml2js');
const quotes = require('./quotes.json');
const randomizer = require('./randomizer.js');

function getRandomQuote(callBack) {

	var options = {
		protocol: 'http:',
		host: 'api.forismatic.com',
		path: '/api/1.0/?method=getQuote&format=xml&lang=en',
		port: 80,
		method: 'GET'
	};

	var request = http.request(options, function(response) {
		var result = "";
		response.on('data', function(data) {
			result += data;
		});
		response.on('end', function(data) {
			xml2js.parseString(result, function(err, finalResult) {
				if (err)
					callBack(err);
				else
					callBack(null, response.statusCode, finalResult);
			});
		});
	});

	request.end();
};

function getTimeQuote() {
	return randomizer(quotes);
};

module.exports = {
	getRandomQuote,
	getTimeQuote
};