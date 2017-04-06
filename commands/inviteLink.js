const checkOwner= require('../util/checker').checkOwner;

module.exports = {
	name: 'Invite Link',
	usage: `${PREFIX}invite <[permissions]>`,
	description: 'Sends an invite link',
	hidden: true,
	executor(message, bot) {
		if (!checkOwner(message.author)) {
			message.channel.sendMessage(`You don't have enough juice!`);
			return;
		}
		var permissions = message.content.split(' ').slice(1);
		if (permissions)
			console.log(permissions);
		bot.generateInvite(permissions).then(function (invite) {
			//logger.log('Invite Created With Permissions ' + permissions);
			console.log('Invite Created With Permissions ' + (permissions.length == 0 ? 'NO PERMISSIONS' : permissions));
			message.channel.sendMessage(invite);
		}).catch(console.err);
	}
};