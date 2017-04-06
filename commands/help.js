module.exports = {
	name: 'Help',
	usage: `${PREFIX}help`,
	description: 'Display Available Commands',
	hidden: false,
	executor(message, bot, commands) {
		let result = '';
		for (let command in commands) {
			if (!commands[command].hidden)
				result += `**Name :** ${commands[command].name} **Usage :** ${commands[command].usage} **Description :** ${commands[command].description}` + '\n';
		}
		message.channel.sendMessage(result);
	}
};