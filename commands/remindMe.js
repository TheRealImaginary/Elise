const RichEmbed = require('discord.js').RichEmbed;
const chrono = require('chrono-node');

const quotes = require('./quotes.js');
const TimeQuote = quotes.TimeQuote;

module.exports = {
	name: 'Reminder',
	usage: `${PREFIX}remindMe <time> <context>`,
	description: 'Reminds You Of Something',
	hidden: false,
	executor(message) {
		let timeAndData = message.content.substring(PREFIX.length + this.name.length + 1).split(' ');
		if (timeAndData.length == 0) {
			message.channel.sendMessage('You must atleast provoid me with time.');
			return;
		}
		let parsed = chrono.parse(timeAndData[0]);
		if (!parsed || parsed == [] || !parsed[0] || !parsed[0].start || parsed[0].start == {}) {
			message.channel.sendMessage('I had trouble understanding that.');
			return;
		}
		let ms = parsed[0].start.date() - new Date(),
			context = timeAndData.slice(1).join(' ') || '';
		if (ms < 0) {
			TimeQuote((result) => {
				message.channel.sendMessage(`${result.quote} ~${result.author}.`);
			});
			return;
		}
		message.channel.sendMessage(`I will remind you in ${ms} ms in a DM. Do the math human.`);
		setTimeout(() => {
			if (context == '')
				message.author.sendMessage('You asked to be reminded now of something you never told me!');
			else
				message.author.sendMessage(`You asked to be reminded now of "${context}".`);
		}, ms);
	}
};