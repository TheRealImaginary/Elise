const checkPermission = require('../util/checker').checkPermission;

module.exports = {
	name: 'Mute',
	usage: `${PREFIX}mute <@member>`,
	description: 'Mutes A Member',
	hidden: false,
	executor(message) {
		if (!checkPermission(message.member, 'MUTE_MEMBERS')) {
			message.channel.sendMessage(`You don't have enough juice!`);
			return;
		}
		let guild = message.guild;
		if (guild && guild.available) {
			let user = message.mentions.users.first();
			if(!user){
				message.channel.sendMessage(`Please mention a member to mute!`);
				return;
			}
			let guildMember = guild.member(user);
			if (!guildMember) {
				message.channel.sendMessage(`Couldn't find a member with that name!`);
				return;
			}
			if (guildMember.selfMute || guildMember.selfDeaf || guildMember.serverMute || guildMember.serverDeaf) {
				message.channel.sendMessage(`Member is already muted/deafen.`);
				return;
			}
			guildMember.setMute(true).then((member) => {
				console.log(`${member.user.username} got muted by ${message.author.username}.`);
			}).catch(console.err);
		} else
			console.log('Guild is not available for muting a member!');
	}
};