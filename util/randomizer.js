function getRandom(low, high) {
  return Math.floor((Math.random() * (high - low)) + low);
}

function randomizer(list) {
  if (typeof list === 'string') {
    list = list.split(',');
  }
  if (!list || list.length === 0) {
    return null;
  }
  return list[getRandom(0, list.length)];
}

module.exports = {
  randomizer,
  getRandom,
};
