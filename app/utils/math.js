// Generate a random integer between 'min' and 'max'
const randInt = (min, max) => Math.floor(Math.random() * max) + min;

module.exports = { randInt };
