const isProperUrghCommand = (message) => {
  // This will render either !ugh or !urgh
  const startOfMessage = message.split(" ")[0];
  return startOfMessage === "!urgh" || startOfMessage === "!ugh";
};

module.exports = { isProperUrghCommand };
