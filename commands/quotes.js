const xml2js = require('xml2js');
const request = require('request');
const quotes = require('./quotes.json');
const randomizer = require('../util/randomizer.js');

function getRandomQuote(callBack) {

	let options = {
		url: 'http://api.forismatic.com/api/1.0/?method=getQuote&format=xml&lang=en',
		method: 'GET',
	};

	request(options, (err, response, body) => {
		if (err) {
			callBack(err);
		} else {
			xml2js.parseString(body, (err, parsed) => {
				if (err) {
					callBack(err);
				} else {
					callBack(null, parsed);
				}
			});
		}
	});
};

function getTimeQuote(callBack) {
	callBack(randomizer(quotes));
};

module.exports = {
	RandomQuote: {
		name: 'Quote',
		usage: `${PREFIX}quote`,
		description: 'Gets a random quote!',
		permissions: false,
		hidden: false,
		executor(message) {
			getRandomQuote(function (err, quote) {
				if (err) {
					message.channel.sendMessage('Error parsing data!');
					return;
				} else {
					let quoteObj = quote.forismatic.quote[0];
					message.channel.sendMessage(`"${quoteObj.quoteText[0]}" ~${quoteObj.quoteAuthor[0]}`);
				}
			});
		}
	},
	TimeQuote: getTimeQuote
};