export default (window, dateProvider) => {
  return () => {
    const date = dateProvider();
    const { innerWidth, innerHeight, navigator } = window;
    const environment = {
      browserDetails: {
        viewportWidth: innerWidth,
        viewportHeight: innerHeight
      },
      placeContext: {
        localTime: date.toISOString(),
        localTimezoneOffset: date.getTimezoneOffset()
      }
    };
    // not all browsers support navigator.connection.effectiveType
    if (
      navigator &&
      navigator.connection &&
      navigator.connection.effectiveType
    ) {
      environment.connectionType = navigator.connection.effectiveType;
    }
    return { environment };
  };
};
