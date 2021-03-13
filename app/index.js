const mongoose = require("mongoose");
const tmi = require("tmi.js");
const config = require("./config");
const { randInt } = require("./utils/math.js");
const { messageToUgh } = require("./utils/stringManip");
const {
  addUserToIgnore,
  removeUserToIgnore,
  findIgnoredUser,
  addUrghbotToChannel,
  removeUrghbotFromChannel,
  findAllChannelsForUrghbot,
} = require("./utils/db");
const { twitchGetChannelIdByUsername, twitchGetAllChannelUsernames } = require("./utils/twitch");
const { restartBot } = require("./utils/sys");
const { isProperUrghCommand, isInUrghBotChannel } = require("./utils/urghLogic");

// MikamiHero channel name
const masterChannel = "MikamiHero";
// Urghbot's own channel name
const urghbotChannel = "urghbot";

const initialOptions = {
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
  // Initially, only have urghbot listening to its own channel (for add and remove commands)
  channels: [urghbotChannel],
};

(async () => {
  try {
    console.log("Welcome.");

    // DB open listener
    const connection = mongoose.connection;
    await connection.once("open", () => {
      console.log("Ugh. MongoDB database connection is open and ready");
    });

    // DB setup
    await mongoose
      .connect(process.env.MONGODB_URGHBOT_URI || config.mongodbUrghBotURI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
      })
      .then(() => console.log("Ugh. MongoDB database connection connected!"));

    // Finding all the channels that Urghbot has permissions to interact in (from DB)
    const channels = await findAllChannelsForUrghbot();
    // For each channel ID, find their username (don't want to store because it can change)
    const channelUsernames = await twitchGetAllChannelUsernames({ channelIds: channels });
    const twitchChannelsForUrghBot = initialOptions.channels.concat(channelUsernames);

    // TODO: Make do a seed script in case it gets nuked?
    const options = { ...initialOptions, channels: twitchChannelsForUrghBot };
    const client = new tmi.client(options);

    client.connect();

    // upon connecting, message the bot displays
    client.on("connected", (address, port) => {
      twitchChannelsForUrghBot.forEach((channel) => {
        client.say(channel, "Ugh. I'm connected...");
      });
    });

    // Commands and/or certain character triggers
    client.on("chat", async (channel, user, message, self) => {
      try {
        // Setting up the display name of the author of the message
        const twitchDisplayName = user["display-name"];
        // Setting up the username of the author of the message
        const twitchUsername = user["username"];
        // Setting up the channel/user ID of the author of the message
        const twitchUserChannelId = await twitchGetChannelIdByUsername({ username: twitchUsername });
        // Setting up the channel ID where Urghbot detected the message in
        const twitchChannel = channel.replace("#", "");
        const twitchChannelId = await twitchGetChannelIdByUsername({ username: twitchChannel });
        // Don't want to react to itself
        if (self) {
          return;
        }
        // If it's in urghbot's own channel
        else if (isInUrghBotChannel(channel)) {
          // If people want Urghbot to join their channel
          if (message === "!join") {
            const addedChannel = await addUrghbotToChannel({ channelId: twitchUserChannelId });
            if (!addedChannel) {
              client.say(channel, `${twitchDisplayName}, I'm already in your channel. Ugh.`);
            } else {
              client.say(channel, `Ugh. What a drag. Fine... I'm now in your channel, ${twitchDisplayName}.`);
              const joinedChannel = await client.join(twitchUsername);
            }
          }
          // If people have Urghbot but want it to piss off
          if (message === "!leave") {
            const removedChannel = await removeUrghbotFromChannel({
              channelId: twitchUserChannelId,
            });
            if (!removedChannel) {
              client.say(channel, `${twitchDisplayName}, I've already left. Ugh.`);
            } else {
              client.say(channel, `Is this how you treat all your bots? Ugh. Fine <leaves ${twitchDisplayName}>`);
              const leftChannel = await client.part(twitchUsername);
            }
          }
        }
        // If someone wants to have themselves ignored by urghbot
        else if (message === "!ignore") {
          const ignoredUser = await addUserToIgnore({
            channelId: twitchChannelId,
            userToIgnoreId: twitchUserChannelId,
          });
          if (!ignoredUser) {
            client.say(channel, `${twitchDisplayName}, you're already being ignored. Ugh.`);
          } else {
            client.say(channel, `Ugh. Bye. <ignores ${twitchDisplayName}>`);
          }
        }
        // If someone wants to be acknowledged by urghbot again
        else if (message === "!unignore") {
          const unignoredUser = await removeUserToIgnore({
            channelId: twitchChannelId,
            userToIgnoreId: twitchUserChannelId,
          });
          if (!unignoredUser) {
            client.say(channel, `${twitchDisplayName}, you weren't ignored in the first place. Ugh.`);
          } else {
            client.say(channel, `Ugh. Fine. <unignores ${twitchDisplayName}>`);
          }
        }
        // If someone wants to praise UrghBot
        else if (message === "urghbot yes" || message === "@urghbot yes") {
          client.say(channel, `PogChamp`);
        }
        // If someone wants to scold UrghBot
        else if (message === "urghbot no" || message === "@urghbot no") {
          client.say(channel, "BibleThump");
        }
        // If the message contains 'yeah nah' or 'yea nah'
        else if (message.toLowerCase().includes("yeah nah") || message.toLowerCase().includes("yea nah")) {
          client.say(channel, "Ugh. Nah yeah Kappa");
        }
        // If the message contains 'nah yeah' or 'nah yeah'
        else if (message.toLowerCase().includes("nah yeah") || message.toLowerCase().includes("nah yeah")) {
          client.say(channel, "Ugh. Yeah nah Kappa");
        }
        // If someone wants to 'ugh'/'urgh' themselves or something else
        else if (isProperUrghCommand(message) === true) {
          const urghStringSplit = message.split(" ");
          if (urghStringSplit.length === 1) {
            client.say(channel, `Ugh. ${twitchDisplayName}.`);
          } else {
            const thingsToUrgh = urghStringSplit.splice(1);
            if (thingsToUrgh === "") {
              // Twitch doesn't allow messages to be ended with more than a single space (it adds a period afterwards and pops the whitespace out)
              // Keeping this logic here just in case it changes.
              client.say(channel, `Ugh. Nothing.`);
            } else {
              // Joining all the other arguments back
              const joinedThingsToUrgh = thingsToUrgh.join(" ");
              client.say(channel, `Ugh. ${joinedThingsToUrgh}`);
            }
          }
        }
        // If the message contains 'glitches'
        else if (message.toLowerCase().includes("glitches")) {
          client.say(channel, "Ugh. Glitches? More like cheaters.");
        } else {
          //  Generate random number and check if it's divisible by 13 (15/200 numbers = 7.5% chance of firing)
          const x = randInt(1, 200);
          if (x % 13 === 0) {
            // First check if the user is meant to be ignored or not
            const userToIgnore = await findIgnoredUser({
              channelId: twitchChannelId,
              userToIgnoreId: twitchUserChannelId,
            });
            // If they are not found in the ignored user DB, then proceed to ugh their message
            if (!userToIgnore) {
              // If they are the lucky one, 'ugh'-ify the user's message (if there is a noun in it)
              const ughString = await messageToUgh(message);
              if (ughString !== "") {
                client.say(channel, ughString);
              }
            }
          }
        }
      } catch (err) {
        console.log(err);
        // For some reason this happens and it is a known issue in tmi.js, so just swallowing it for now
        if (err !== "No response from Twitch.") {
          client.say(channel, `I think we have a problem... Please contact MikamiHero.`);
        }
      }
    });
  } catch (e) {
    // Deal with the fact the chain failed
    console.log(e);
  }
})();
