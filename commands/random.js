const randomizer = require('../util/randomizer');

let config;
try {
	config = require('../config.json');
} catch (err) {
	config = {};
	console.log('Quotes Couldn\'t find config.');
}

const PREFIX = process.env.PREFIX || config.PREFIX;

module.exports = {
	name: 'Random',
	usage: PREFIX + 'random <item1,item2,item3>',
	description: 'Use to get a random choice from the given list.',
	hidden: false,
	// permissions: commandPermissions.USER,
	executor(message) {
		var game = randomizer(message.content.substring(PREFIX.length + this.name.length + 1));
		if (!game)
			message.channel.sendMessage("You didn't give me anything to choose from :(!");
		else {
			if (Math.random() < 0.5)
				message.channel.sendMessage('The Random choice is ' + game.trim());
			else
				message.channel.sendMessage(`Go ${game.trim()}, I choose you.`);
		}
	}
};