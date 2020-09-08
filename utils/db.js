const IgnoredUser = require("../models/ignoredUser.model");

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

module.exports = { addUserToIgnore, removeUserToIgnore, findIgnoredUser };
