const checkOwner = require('../util/checker').checkOwner;

module.exports = {
	name: 'Sleep',
	usage: `${PREFIX}sleep`,
	description: 'Bot can get some rest.',
	hidden: true,
	executor(message, bot) {
		if (!checkOwner(message.author)) {
			message.channel.sendMessage(`You don't have enough juice!`);
			return;
		}
		if (bot.isASleep) {
			return;
		}
		bot.isASleep = true;
		message.channel.sendMessage('Good Night!');
	}
};