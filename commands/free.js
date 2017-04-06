const checker = require('../util/checker');
const checkPermission = checker.checkPermission;
const checkOwner = checker.checkOwner;

module.exports = {
	name: 'Free',
	usage: `${PREFIX}free <@member>`,
	description: 'Bail for inmate',
	hidden: false,
	executor(message) {
		if (!checkPermissions(message, 'MANAGE_ROLES_OR_PERMISSIONS') && !checkOwner(message)) {
			message.channel.sendMessage(`You don't have enough juice!`);
			return;
		}
		let guild = message.guild;
		if (guild && guild.available) {
			let user = message.mentions.users.first();
			if (!user) {
				message.channel.sendMessage(`Please mention a member to mute!`);
			}
			let guildMember = guild.member(user);
			if (!guildMember) {
				message.channel.sendMessage(`Couldn't find a member with that name!`);
				return;
			}
			for (let [key, val] of guild.roles) {
				if (val.name.toLowerCase() == 'inmate') {
					guildMember.removeRole(val);
					break;
				}
			}
			// if (!guildMember.voiceChannel) {
			// 	message.channel.sendMessage(`Member isn't in a voice channel.`);
			// 	return;
			// }
			// if (guildMember.voiceChannel.name.toLowerCase() !== 'jail') {
			// 	message.channel.sendMessage(`Member isn't in jail.`);
			// 	return;
			// }
			// guildMember.setVoiceChannel(normalChannel);
		} else
			console.log('Guild isnot available for free-ing a member!');
	}
};