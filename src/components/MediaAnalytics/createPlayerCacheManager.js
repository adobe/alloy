export default () => {
  const cache = {};

  const put = (playerId, value) => {
    cache[playerId] = value;
  };

  const update = (playerId, data) => {
    if (!cache[playerId]) {
      return;
    }

    const key = data.key;
    const value = data.value;

    cache[playerId][key] = value;
  };

  const get = playerId => {
    return cache[playerId];
  };

  const remove = playerId => {
    delete cache[playerId];
  };

  const startTicker = ({ playerId, sessionId, heartbeatTicker }) => {
    const player = cache[playerId];
    if (!player) {
      return;
    }

    player.ticker = setInterval(() => {
      heartbeatTicker({ sessionId, playerId });
    }, 1000);

    player.latestTriggeredEvent = Date.now();
  };
  return {
    put,
    update,
    get,
    remove,
    startTicker
  };
};
