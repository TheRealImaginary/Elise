var randomizer = function(list) {
	list = games.split(',');
	if (!list || !list.length)
		return null;
	return list[getRandom(0, list.length)];
};

var getRandom = function(low, high) {
	return Math.floor(Math.random() * (high - low) + low);
};

module.exports = randomizer;