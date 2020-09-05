const WordPos = require("wordpos");
const pluralize = require("pluralize");
const { randInt } = require("./math.js");

const messageToUgh = async (message) => {
  // find all the nouns in the message
  const nouns = await findNouns(message);
  const numOfNouns = nouns.length;
  // randomly pick a noun from the list (if the list isn't empty)
  if (numOfNouns === 0) {
    return "";
  }
  // First, we want to pluralize all the nouns.
  const pluralizedNouns = nouns.map((noun) => pluralize.plural(noun));
  const randomIndex = randInt(0, numOfNouns);
  const randomNoun = pluralizedNouns[randomIndex];
  const capitalizedRandomNoun = capitalize(randomNoun);
  // 'ugh'ify it and return
  const ughMessage = `Ugh. ${capitalizedRandomNoun}.`;
  return ughMessage;
};

// Function to find all the nouns in a given sentence
const findNouns = async (str) => {
  // instantiate wordpos
  const wordpos = new WordPos();
  // split message into single words
  const words = str.split(" ");
  const nouns = [];
  const checkingNouns = await Promise.all(
    words.map(async (word) => {
      // singularize the word
      const singularWord = pluralize.singular(word);
      // check if it's a noun
      const isNoun = await wordpos.isNoun(singularWord);
      // if it's a noun and isn't part of the excluded words, add it to the nouns array
      if (isNoun & !excludedWord(singularWord)) {
        nouns.push(singularWord);
      }
    })
  );
  return nouns;
};

// words to exclude from nouns
const excludedWord = (word) => ["i", "am"].includes(word.toLowerCase());

// capitalize first character of a string
const capitalize = (str) => {
  if (typeof str !== "string") {
    return "";
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
};

module.exports = { messageToUgh };
