export default () => {
  let hasDestinationExpired = true;

  return {
    namespace: "Audiences",
    lifecycle: {
      onBeforeViewStart(payload) {
        console.log("Audiences:::onBeforeViewStart");
        if (hasDestinationExpired) {
          payload.appendToQuery({
            destinations: true
          });
          hasDestinationExpired = false;
        }
      },
      onViewStartResponse({ destinations = [] } = {}) {
        console.log("Audiences:::onViewStartResponse");
        destinations.forEach(dest => console.log(dest.url));
      }
    }
  };
};
