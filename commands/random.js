const randomizer = require('../util/randomizer').randomizer;

module.exports = {
	name: 'Random',
	usage: `${PREFIX}random <item1,item2,item3>`,
	description: 'Use to get a random choice from the given list.',
	hidden: false,
	executor(message) {
		var game = randomizer(message.content.substring(PREFIX.length + this.name.length + 1));
		if (!game)
			message.channel.sendMessage(`You didn't give me anything to choose from :(!`);
		else {
			if (Math.random() < 0.5)
				message.channel.sendMessage('The Random choice is ' + game.trim());
			else
				message.channel.sendMessage(`Go ${game.trim()}, I choose you.`);
		}
	}
};