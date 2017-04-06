const RichEmbed = require('discord.js').RichEmbed;

function getBotStatus(bot) {
	var embed = new RichEmbed(),
		uptime = Math.floor(bot.uptime / 1000),
		hours = Math.floor(uptime / 3600),
		minutes = Math.floor((uptime % 3600) / 60),
		seconds = (uptime % 3600) % 60,
		memoryUsed = process.memoryUsage().heapUsed;
	// var os = require('os');
	// console.log(Math.floor(os.freemem()));
	// console.log(Math.floor(os.totalmem()));
	// console.log(os.uptime());
	embed.setThumbnail(bot.user.avatarURL);
	embed.setTitle('__**Bot Status**__');
	embed.addField('➤Uptime', `⬧Hours: ${hours}\n⬧Minutes: ${minutes}\n⬧Seconds: ${seconds}`);
	embed.addField('➤Memory Usage', `⬧Memory Used: ${Math.floor(memoryUsed / (1024 * 1024))} MB`);
	embed.addField('➤Misc', `⬧Commands Executed: ${bot.commandsExecuted}`);
	embed.setColor('#FF0000');
	embed.setTimestamp(new Date());
	embed.setFooter(bot.user.username, bot.user.avatarURL);
	return embed;
};

module.exports = {
	name: 'Status',
	usage: `${PREFIX}status`,
	description: `Use to get bot's status`,
	hidden: false,
	executor(message, bot) {
		message.channel.sendEmbed(getBotStatus(bot));
	}
};