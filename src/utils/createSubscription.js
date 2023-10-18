const createSubscription = () => {
  let counter = 0;
  const subscriptions = {};

  const createUnsubscribe = id => {
    return () => {
      delete subscriptions[id];
    };
  };

  const add = callback => {
    if (typeof callback !== "function") {
      return () => undefined;
    }

    counter += 1;
    subscriptions[counter] = callback;
    return createUnsubscribe(counter);
  };

  const emit = (...args) => {
    Object.values(subscriptions).forEach(callback => {
      callback(...args);
    });
  };

  const hasSubscriptions = () => Object.keys(subscriptions).length > 0;

  return {
    add,
    emit,
    hasSubscriptions
  };
};

export default createSubscription;
