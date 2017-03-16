function randomizer(list) {
	if (typeof list === 'string')
		list = list.split(',');
	if (!list || !list.length)
		return null;
	return list[getRandom(0, list.length)];
};

function getRandom(low, high) {
	return Math.floor(Math.random() * (high - low) + low);
};

module.exports = randomizer;