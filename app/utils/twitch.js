const rp = require("request-promise");
const { twitchBotClientId, twitchBotClientSecret } = require("../config");

const twitchAuthenticate = async () => {
  // Setting up the options for the request
  const clientIdQuery = `client_id=${twitchBotClientId}`;
  const clientSecretQuery = `client_secret=${twitchBotClientSecret}`;
  const clientGrantTypeQuery = `grant_type=client_credentials`;
  const options = {
    uri:
      "https://id.twitch.tv/oauth2/token" + `?${clientIdQuery}` + `&${clientSecretQuery}` + `&${clientGrantTypeQuery}`,
    method: "POST",
    json: true,
  };
  // Make the request to get the auth details
  const auth = await rp(options);
  return auth;
};

const twitchGetChannelIdByUsername = async ({ username }) => {
  // Auth for a bearer token
  const twitchAuth = await twitchAuthenticate();
  const twitchBearerToken = twitchAuth.access_token;
  // Settting up the options for the request
  const options = {
    headers: {
      "Content-Type": "application/json",
      "client-id": twitchBotClientId,
      Authorization: `Bearer ${twitchBearerToken}`,
    },
    uri: "https://api.twitch.tv/helix/users" + `?login=${username}`,
    method: "GET",
    json: true,
  };
  // Requesting for the Twitch user (which will contain their ID)
  const twitchUser = await rp(options);
  return twitchUser.data[0].id;
};

const twitchGetUsernameByChannelId = async ({ channelId }) => {
  // Auth for a bearer token
  const twitchAuth = await twitchAuthenticate();
  const twitchBearerToken = twitchAuth.access_token;
  // Settting up the options for the request
  const options = {
    headers: {
      "Content-Type": "application/json",
      "client-id": twitchBotClientId,
      Authorization: `Bearer ${twitchBearerToken}`,
    },
    uri: "https://api.twitch.tv/helix/users" + `?id=${channelId}`,
    method: "GET",
    json: true,
  };
  // Requesting for the Twitch user (which will contain their username)
  const twitchUser = await rp(options);
  return twitchUser.data[0].login;
};

const twitchGetAllChannelUsernames = async ({ channelIds }) => {
  const twitchUsernames = await Promise.all(
    channelIds.map(async (channelId) => await twitchGetUsernameByChannelId({ channelId }))
  );
  return twitchUsernames;
};

module.exports = { twitchGetChannelIdByUsername, twitchGetAllChannelUsernames };
