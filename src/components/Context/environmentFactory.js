export default (window, dateProvider) => {
  return () => {
    const date = dateProvider();
    const {
      innerWidth,
      innerHeight,
      navigator: {
        connection: { effectiveType }
      }
    } = window;
    return {
      environment: {
        browserDetails: {
          viewportWidth: innerWidth,
          viewportHeight: innerHeight
        },
        connectionType: effectiveType,
        placeContext: {
          localTime: date.toISOString(),
          localTimezoneOffset: date.getTimezoneOffset()
        }
      }
    };
  };
};
