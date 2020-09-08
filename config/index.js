// Define a config object to be exported
const config = {};

// Environment
config.nodeEnv = process.env.NODE_ENV;

// Database mongoDB config
config.mongodbUrghBotURI = process.env.MONGODB_URGHBOT_URI;

// Bot details
config.botUsername = process.env.TWITCH_BOT_USERNAME;
config.botPassword = process.env.TWITCH_BOT_PASSWORD;

// Bot debug (set to 'false' in production)
config.useDebug = config.nodeEnv === "production" ? false : true;

module.exports = config;
