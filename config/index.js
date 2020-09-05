// Define a config object to be exported
const config = {};

// Environment
config.nodeEnv = process.env.NODE_ENV;

// Bot details
config.botUsername = process.env.TWITCH_BOT_USERNAME;
config.botPassword = process.env.TWITCH_BOT_PASSWORD;

// Bot debug (set to 'false' in production)
config.useDebug = config.nodeEnv === "production" ? false : true;

module.exports = config;
