module.exports = {
	name: 'Coin Flip',
	usage: `${PREFIX}coinflip`,
	description: 'Flips A Coin',
	hidden: false,
	executor(message) {
		message.channel.sendMessage(`It is ${Math.random() < 0.5?'Heads':'Tails'}`);
	}
};