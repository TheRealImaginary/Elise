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
 * @returns {?*} The Random Element.
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

/**
 * Shuffles an array.
 * @param {Array<*>} list - The Array to shuffle.
 */
function shuffle(list) {
  const n = list.length;
  for (let i = 0; i < n; i += 1) {
    const newIndex = i + (Math.floor(Math.random() * (n - i)));
    const temp = list[newIndex];
    list[newIndex] = list[i];
    list[i] = temp;
  }
}

/**
 * Returns the distinct number of elements in an Array or String.
 * @param {string|Array<*>} list
 * @return {number} The number of distinct elements.
 */
function distinct(list) {
  if (typeof list === 'string') {
    list = list.split('');
  }
  console.log(typeof list);
  list = list.filter((el, index) => (el !== ' ' && list.indexOf(el) === index));
  console.log(list);
  return list.length;
}

module.exports = {
  randomizer,
  getRandom,
  shuffle,
  distinct,
};
