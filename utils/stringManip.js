const WordPos = require("wordpos");
const pluralize = require("pluralize");
const { randInt } = require("./math.js");

// List of words to ignore because it gets spammy (e.g., articles)
const ignoredWords = ["i", "am", "why", "it", "a", "an", "the", "or", "so"];

// MikamiHero emotes to potentially urghify
const mikamiHeroEmotes = [
  "mikamiA",
  "mikamiC",
  "mikamiDerp",
  "mikamiGah",
  "mikamiHiYo",
  "mikamiHype",
  "mikamiKawaii",
  "mikamiL",
  "mikamiLUL",
  "mikamiLove",
  "mikamiOof",
  "mikamiS",
  "mikamiSchoey",
  "mikamiT",
  "mikamiWah",
  "mikamiZ",
  "mikamiS2",
  "mikamiSellout",
];

const messageToUgh = async (message) => {
  // find all the nouns in the message
  const nouns = await findNouns(message);
  const numOfNouns = nouns.length;
  // randomly pick a noun from the list (if the list isn't empty)
  if (numOfNouns === 0) {
    return "";
  }
  const randomIndex = randInt(0, numOfNouns);
  const randomNoun = nouns[randomIndex];
  // If the random noun is a MikamiHero emote, don't pluralize or add a period at the end. Just 'ugh' it.
  if (mikamiHeroEmotes.includes(randomNoun)) {
    const urghMessage = `Ugh. ${randomNoun}`;
    return urghMessage;
  }
  // If the random noun selected isn't a MikamiHero, pluralize and add period at the end. Then 'ugh' it.
  else {
    const pluralizedNoun = pluralize.plural(randomNoun);
    const capitalizedRandomNoun = capitalize(pluralizedNoun);
    const ughMessage = `Ugh. ${capitalizedRandomNoun}.`;
    return ughMessage;
  }
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
      // if word is a MikamiHero emote, add it in and do not do any checks
      if (mikamiHeroEmotes.includes(word)) {
        nouns.push(word);
      } else {
        // singularize the word
        const singularWord = pluralize.singular(word);
        // check if it's a noun
        const isNoun = await wordpos.isNoun(singularWord);
        // if it's a noun and isn't part of the excluded words, add it to the nouns array
        if (isNoun & !excludedWord(singularWord)) {
          nouns.push(singularWord);
        }
      }
    })
  );
  return nouns;
};

// words to exclude from nouns
const excludedWord = (word) => ignoredWords.includes(word.toLowerCase());

// capitalize first character of a string
const capitalize = (str) => {
  if (typeof str !== "string") {
    return "";
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
};

module.exports = { messageToUgh };
