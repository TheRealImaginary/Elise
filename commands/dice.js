const getRandom = require('../util/randomizer').getRandom;

module.exports = {
	name: 'Dice Roll',
	usage: `${PREFIX}dice <faces>`,
	description: 'Rolls a dice with \'n\' Faces.',
	hidden: false,
	executor(message) {
		let faces = message.content.split(' ')[1];
		if (!faces || faces === ' ' || faces <= 0)
			faces = 6;
		let die = getRandom(1, faces);
		message.channel.sendMessage(`You rolled ${die}.`);
	}
};