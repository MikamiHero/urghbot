const IgnoredUser = require("../models/ignoredUser.model");
const Channel = require("../models/channel.model");

// Add user to be ignored to the database
const addUserToIgnore = async ({ username }) => {
  // Checking if the user already exists. If they do, return
  const ignoredUser = await findIgnoredUser({ username });
  if (!ignoredUser) {
    const newUserToIgnore = new IgnoredUser({ username });
    const newUserToIgnoreSaved = await newUserToIgnore.save();
    return true;
  }
  return false;
};

// Remove user to be ignored from db
const removeUserToIgnore = async ({ username }) => {
  const ignoredUser = await findIgnoredUser({ username });
  // If no user was found, just return
  if (!ignoredUser) {
    return false;
  }
  const removedIgnoredUser = await IgnoredUser.deleteOne(ignoredUser);
  return true;
};

// Find the ignored user in the db (if they exist)
const findIgnoredUser = async ({ username }) => await IgnoredUser.findOne({ username });

// Twitch channel wants to use Urghbot
const addUrghbotToChannel = async ({ channelName, channelId }) => {
  // Checking if the channel is already using Urghbot
  const existingChannel = await findChannelById({ channelId });
  if (!existingChannel) {
    const newChannelForUrghbot = new Channel({ name: channelName, channelId });
    const newChannelSaved = await newChannelForUrghbot.save();
    return true;
  }
  return false;
};

// Twitch channel wants to remove Urghbot
const removeUrghbotFromChannel = async ({ channelName, channelId }) => {
  const existingChannel = await findChannelById({ channelId });
  // If no Twitch channel was found, just return
  if (!existingChannel) {
    return false;
  }
  const removedTwitchChannel = await Channel.deleteOne(existingChannel);
  return true;
};

// Find the existing channel in the db by name (if it exists)
const findChannelByName = async ({ name }) => await Channel.findOne({ name });

// Find the existing channel in the db by Twitch channel ID (if it exists)
const findChannelById = async ({ channelId }) => await Channel.findOne({ channelId });

// Find all the existing channels that Urghbot is apart of
const findAllChannelsForUrghbot = async () => {
  const allChannels = await Channel.find();
  const allChannelsOnlyUsername = allChannels.map((channel) => channel.name);
  return allChannelsOnlyUsername;
};

module.exports = {
  addUserToIgnore,
  removeUserToIgnore,
  findIgnoredUser,
  addUrghbotToChannel,
  removeUrghbotFromChannel,
  findAllChannelsForUrghbot,
};
