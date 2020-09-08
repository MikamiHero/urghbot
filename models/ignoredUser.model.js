const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ignoredUserSchema = new Schema(
  {
    username: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const IgnoredUser = mongoose.model("IgnoredUser", ignoredUserSchema);

module.exports = IgnoredUser;
