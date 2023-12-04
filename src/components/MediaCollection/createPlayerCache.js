export default () => {
  const cache = {};
  const put = (playerId, value) => {
    cache[playerId] = value;
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

  const stopTicker = ({ playerId }) => {
    const player = cache[playerId];
    if (!player) {
      return;
    }
    clearInterval(player.ticker);
    player.ticker = null;
  };
  const updateLastTriggeredEventTS = ({ playerId }) => {
    const player = cache[playerId];
    if (!player) {
      return;
    }
    player.latestTriggeredEvent = Date.now();
  };
  return {
    get,
    put,
    remove,
    startTicker,
    stopTicker,
    updateLastTriggeredEventTS
  };
};
