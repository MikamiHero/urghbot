const IgnoredUser = require("../models/ignoredUser.model");
const Channel = require("../models/channel.model");

// Add user to be ignored to the database
const addUserToIgnore = async ({ channelId, userToIgnoreId }) => {
  // Checking if the user already exists. If they do, return
  const ignoredUser = await findIgnoredUser({ channelId, userToIgnoreId });
  if (!ignoredUser) {
    const newUserToIgnore = new IgnoredUser({ channelId, userToIgnoreId });
    const newUserToIgnoreSaved = await newUserToIgnore.save();
    return true;
  }
  return false;
};

// Remove user to be ignored from db
const removeUserToIgnore = async ({ channelId, userToIgnoreId }) => {
  const ignoredUser = await findIgnoredUser({ channelId, userToIgnoreId });
  // If no user was found, just return
  if (!ignoredUser) {
    return false;
  }
  const removedIgnoredUser = await IgnoredUser.deleteOne(ignoredUser);
  return true;
};

// Find the ignored user in the db (if they exist)
const findIgnoredUser = async ({ channelId, userToIgnoreId }) =>
  await IgnoredUser.findOne({ channelId, userToIgnoreId });

// Twitch channel wants to use Urghbot
const addUrghbotToChannel = async ({ channelId }) => {
  // Checking if the channel is already using Urghbot
  const existingChannel = await findChannelById({ channelId });
  if (!existingChannel) {
    const newChannelForUrghbot = new Channel({ channelId });
    const newChannelSaved = await newChannelForUrghbot.save();
    return true;
  }
  return false;
};

// Twitch channel wants to remove Urghbot
const removeUrghbotFromChannel = async ({ channelId }) => {
  const existingChannel = await findChannelById({ channelId });
  // If no Twitch channel was found, just return
  if (!existingChannel) {
    return false;
  }
  const removedTwitchChannel = await Channel.deleteOne(existingChannel);
  return true;
};

// Find the existing channel in the db by Twitch channel ID (if it exists)
// NB: Can also be used to find a user account (as that's effectively a channel)
const findChannelById = async ({ channelId }) => await Channel.findOne({ channelId });

// Find all the existing channels that Urghbot is apart of
const findAllChannelsForUrghbot = async () => {
  const allChannels = await Channel.find();
  const allChannelsByChannelId = allChannels.map((channel) => channel.channelId.toString());
  return allChannelsByChannelId;
};

module.exports = {
  addUserToIgnore,
  removeUserToIgnore,
  findIgnoredUser,
  addUrghbotToChannel,
  removeUrghbotFromChannel,
  findAllChannelsForUrghbot,
};
