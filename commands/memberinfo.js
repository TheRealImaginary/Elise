const RichEmbed = require('discord.js').RichEmbed;

function getMemberInfo(member, bot) {
	if (!member)
		return null;
	let presence = member.user.presence;
	let embed = new RichEmbed();
	embed.setThumbnail(member.user.avatarURL);
	embed.setTitle('__**Member Info**__');
	embed.setAuthor(member.user.username, member.user.avatarURL);
	embed.addField('➤Member', `⬧Nickname: ${member.nickname || 'None'}\n⬧Joined On: ${member.joinedAt}\n⬧Roles: ${member.roles.size}`);
	embed.addField('➤User', `⬧Created On: ${member.user.createdAt}\n⬧Status: ${presence.status}\n⬧Game: ${presence.game?presence.game.name:'None'}\n⬧Intelligent: ${member.user.bot?'Not Yet!':'Yes'}`);
	embed.setTimestamp(new Date());
	embed.setFooter(bot.user.username, bot.user.avatarURL);
	embed.setColor('#FF0000');
	return embed;
};

module.exports = {
	name: 'Member Info',
	usage: `${PREFIX}memberinfo <@name>`,
	description: 'Get Info about given member',
	hidden: false,
	executor(message, bot) {
		if (!message.guild) {
			message.channel.sendMessage('I am sorry human, This is only availble with channels in a guild.');
			return;
		}
		let guild = message.guild;
		if (guild && guild.available) {
			let user = message.mentions.users.first();
			let result = getMemberInfo(guild.member(user), bot);
			if (result)
				message.channel.sendEmbed(result);
			else
				message.channel.sendMessage('No Such User Or The one who coded me is an idiot!');
		} else {
			message.channel.sendMessage('Guild Not Available!');
		}
	}
};