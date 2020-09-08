const mongoose = require("mongoose");
const tmi = require("tmi.js");
const config = require("./config");
const { randInt } = require("./utils/math.js");
const { messageToUgh } = require("./utils/stringManip");
const { addUserToIgnore, removeUserToIgnore, findIgnoredUser } = require("./utils/db");

// MikamiHero channel name
const twitchChannel = "MikamiHero";

const options = {
  options: {
    // set debug: false in production
    debug: config.useDebug,
  },
  connection: {
    reconnect: true,
  },
  identity: {
    // bot name
    username: config.botUsername,
    password: config.botPassword,
  },
  channels: [twitchChannel],
};

// DB setup
mongoose.connect(process.env.MONGODB_URGHBOT_URI || config.mongodbUrghBotURI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

// DB open listener
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("Ugh. MongoDB database connection established successfully");
});

const client = new tmi.client(options);

client.connect();

// upon connecting, message the bot displays
client.on("connected", (address, port) => {
  client.say(twitchChannel, "Ugh. I'm connected...");
});

// Commands and/or certain character triggers
client.on("chat", async (channel, user, message, self) => {
  try {
    // Setting up the display name of the author of the message
    const twitchDisplayName = user["display-name"];
    // Don't want to react to itself
    if (self) {
      return;
    }
    // TODO: add logic to return if the user is meant to be ignored
    // If someone wants to have themselves ignored by urghbot
    else if (message === "!ignore") {
      const ignoredUser = await addUserToIgnore({ username: twitchDisplayName });
      if (!ignoredUser) {
        client.say(twitchChannel, `${twitchDisplayName}, you're already being ignored. Ugh.`);
      } else {
        client.say(twitchChannel, `Ugh. Bye. <ignores ${twitchDisplayName}>`);
      }
    }
    // If someone wants to be acknowledged by urghbot again
    else if (message === "!unignore") {
      const unignoredUser = await removeUserToIgnore({ username: twitchDisplayName });
      if (!unignoredUser) {
        client.say(twitchChannel, `${twitchDisplayName}, you weren't ignored in the first place. Ugh.`);
      } else {
        client.say(twitchChannel, `Ugh. Fine. <unignores ${twitchDisplayName}>`);
      }
    }
    // If someone wants to praise UrghBot
    else if (message === "urghbot yes" || message === "@urghbot yes") {
      client.say(twitchChannel, `PogChamp`);
    }
    // If someone wants to scold UrghBot
    else if (message === "urghbot no" || message === "@urghbot no") {
      client.say(twitchChannel, "BibleThump");
    }
    // If someone wants to 'ugh' or 'urgh' themselves
    else if (message === "!ugh" || message == "!urgh") {
      client.say(twitchChannel, `Ugh. ${twitchDisplayName}.`);
    }
    // If the message contains 'glitches'
    else if (message.toLowerCase().includes("glitches")) {
      client.say(twitchChannel, "Ugh. Glitches? More like cheaters.");
    } else {
      //  Generate random number and check if it's divisible by 13 (15/200 numbers = 7.5% chance of firing)
      const x = randInt(1, 200);
      if (x % 13 === 0) {
        // First check if the user is meant to be ignored or not
        const userToIgnore = await findIgnoredUser({ username: twitchDisplayName });
        // If they are not found in the ignored user DB, then proceed to ugh their message
        if (!userToIgnore) {
          // If they are the lucky one, 'ugh'-ify the user's message (if there is a noun in it)
          const ughString = await messageToUgh(message);
          if (ughString !== "") {
            client.say(twitchChannel, ughString);
          }
        }
      }
    }
  } catch (err) {
    client.say(twitchChannel, `@${twitchChannel}, I think we have a problem...`);
    console.log(err);
  }
});
