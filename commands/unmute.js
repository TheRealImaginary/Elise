const checkPermission = require('../util/checker').checkPermission;

module.exports = {
	name: 'Unmute',
	usage: `${PREFIX}unmute <@member>`,
	description: 'Unmutes A Member',
	hidden: false,
	executor(message) {
		if (!checkPermission(message.member, 'MUTE_MEMBERS')) {
			message.channel.sendMessage(`You don't have enough juice!`);
			return;
		}
		let guild = message.guild;
		if (guild && guild.available) {
			let user = message.mentions.users.first();
			if (!user) {
				message.channel.sendMessage(`Please mention a member to mute!`);
				return;
			}
			let guildMember = guild.member(user);
			if (!guildMember) {
				message.channel.sendMessage(`Couldn't find a member with that name!`);
				return;
			}
			guildMember.setMute(false).then(function (member) {
				console.log(`${member.user.username} got unmuted by ${message.author.username}.`);
			}).catch(console.err);
		} else
			console.log('Guild isnot available for unmuting a member!');
	}
};