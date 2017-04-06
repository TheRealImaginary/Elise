const RichEmbed = require('discord.js').RichEmbed;

//TODO : Library for formating below string(common-tags)
//Add AFK time?
function getServerInfo(guild, bot) {
	if (!guild.available)
		return;
	var channels = guild.channels;
	var voiceChannels = channels.filter(function (el) {
		return el.type == 'voice'
	});
	var textChannels = channels.filter(function (el) {
		return el.type == 'text';
	});
	var embed = new RichEmbed();
	embed.setThumbnail(guild.iconURL);
	embed.setTitle('__**Server Info**__');
	embed.setAuthor(guild.name, guild.iconURL);
	embed.addField('➤Channels',
		`⬧Voice Channels: ${voiceChannels.size}\n⬧Text Channels: ${textChannels.size}`);
	embed.addField('➤Members', `⬧Member Count: ${guild.memberCount}\n⬧Owner: ${guild.owner}`);
	embed.addField('➤Miscellaneous', `⬧Role Count: ${guild.roles.size}\n⬧Created At: ${guild.createdAt}\n⬧Location: ${guild.region}`);
	embed.setTimestamp(new Date());
	embed.setFooter(bot.user.username, bot.user.avatarURL);
	embed.setColor('#FF0000');
	return embed;
};

module.exports = {
	name: 'Server Info',
	usage: `${PREFIX}serverinfo`,
	description: 'Get The Current Server Info',
	hidden: false,
	executor(message, bot) {
		message.channel.sendEmbed(getServerInfo(message.guild, bot));
	}
};