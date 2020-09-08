const mongoose = require("mongoose");
const tmi = require("tmi.js");
const config = require("./config");
const { randInt } = require("./utils/math.js");
const { messageToUgh } = require("./utils/stringManip");

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
  // Don't want to react to itself
  if (self) {
    return;
  }
  // If someone wants to praise UrghBot
  if (message === "urghbot yes") {
    client.say(twitchChannel, `PogChamp`);
  }
  // If someone wants to scold UrghBot
  if (message === "urghbot no") {
    client.say(twitchChannel, "BibleThump");
  }
  // If someone wants to 'ugh' or 'urgh' themselves
  if (message === "!ugh" || message == "!urgh") {
    client.say(twitchChannel, `Ugh. ${user["display-name"]}.`);
  }
  // If the message contains 'glitches'
  if (message.toLowerCase().includes("glitches")) {
    client.say(twitchChannel, "Ugh. Glitches? More like cheaters.");
  }
  //  Generate random number and check if it's divisible by 13 (15/200 numbers = 7.5% chance of firing)
  const x = randInt(1, 200);
  if (x % 13 === 0) {
    // If they are the lucky one, 'ugh'-ify the user's message (if there is a noun in it)
    const ughString = await messageToUgh(message);
    if (ughString !== "") {
      client.say(twitchChannel, ughString);
    }
  }
});
