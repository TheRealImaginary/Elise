module.exports = {
	checkPermission(member, permission) {
		return member.permissions.hasPermission(permission);
	},
	checkOwner(author) {
		console.log(author.username, OWNER);
		return author.username === OWNER;
	}
};