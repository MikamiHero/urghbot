const cube = require('scrambler-util');

// Return a cube scramble (3x3 only for now)
const getCubeScramble = () => cube('333');

module.exports = { 
  getCubeScramble
}
