export default ({ eventRegistry }) => {
  const globalContext = {}; // holder of global context like current time/date, browser name/version, day of week, scroll position, time on page, etc
  const getContext = addedContext => {
    return {
      ...globalContext,
      ...addedContext,
      events: eventRegistry.toJSON()
    };
  };

  return {
    getContext
  };
};
