const checkOwner = require('../util/checker').checkOwner;

module.exports = {
	name: 'Reset Nick',
	usage: `${PREFIX}resetNick`,
	description: `Resets Bot's Nickname`,
	hidden: true,
	executor(message, bot) {
		if (!checkOwner(message.author)) {
			message.channel.sendMessage(`You don't have enough juice!`);
			return;
		}
		let guild = message.guild;
		if (guild && guild.available) {
			let member = guild.member(bot.user);
			let newNickname = message.content.split(' ')[1];
			member.setNickname(`${newNickname?newNickname:'Elise'}`);
		}
	}
};