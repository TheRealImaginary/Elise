var http = require('http');
var xml2js = require('xml2js');
const quotes = require('./quotes.json');
const randomizer = require('./randomizer.js');

var config;
try {
	config = require('../config.json');
} catch (err) {
	config = {};
	console.log('Couldn\'t find config.');
}

var PREFIX = process.env.PREFIX || config.PREFIX;

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

function getTimeQuote(callBack) {
	callBack(randomizer(quotes));
};

module.exports = {
	name: 'Quote',
	usage: PREFIX + 'quote',
	description: 'Display Available Commands',
	hidden: false,
	executor: function(message) {
		getRandomQuote(function(err, statusCode, quote) {
			if (err) {
				message.channel.sendMessage('Error parsing data!');
				return;
			}
			if (statusCode !== 200 || !quote)
				message.channel.sendMessage('Error retrieving data.');
			else {
				var quoteObj = quote.forismatic.quote[0];
				message.channel.sendMessage("\"" + quoteObj.quoteText[0] + `\"~${quoteObj.quoteAuthor[0]}`);
			}
		});
	}
};