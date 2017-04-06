module.exports = {
	name: 'Juice',
	usage: `${PREFIX}juice`,
	description: 'Trolls the user',
	hidden: true,
	executor(message) {
		message.channel.sendMessage(`You don't have enough juice to get juice!`);
	}
};