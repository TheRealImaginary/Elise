/**
 * Returns a random number between low and high Exclusive.
 * @param {number} low - Lower Bound.
 * @param {number} high - Upper Bound.
 * @returns {number} The Random Number.
 */
function getRandom(low, high) {
  return Math.floor((Math.random() * (high - low)) + low);
}

/**
 * Returns a random element from an array.
 * @param {Array<*>|string} list - List from which an element must be chosen.
 * @returns {?any} The Random Element.
 */
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
