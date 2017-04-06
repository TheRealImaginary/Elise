const checkOwner = require('../util/checker').checkOwner;

module.exports = {
	name: 'Wake Up',
	usage: `${PREFIX}wakeup`,
	description: 'Bot wakesup',
	hidden: true,
	executor(message, bot) {
		if (!checkOwner(message.author)) {
			message.channel.sendMessage(`You don't have enough juice!`);
			return;
		}
		if (!bot.isASleep) {
			return;
		}
		bot.isASleep = false;
		message.channel.sendMessage('I am awake, I am awake!');
	}
};