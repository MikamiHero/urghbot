const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ignoredUserSchema = new Schema(
  {
    channelId: { type: Number, required: true },
    userToIgnoreId: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const IgnoredUser = mongoose.model("IgnoredUser", ignoredUserSchema);

module.exports = IgnoredUser;
