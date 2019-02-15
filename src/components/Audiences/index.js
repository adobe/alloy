export default () => {
  let hasDestinationExpired = true;

  return {
    namespace: "Audiences",
    onBeforeInteract(payload) {
      console.log("Audiences:::onBeforeInteract");
      if (hasDestinationExpired) {
        payload.appendToQuery({
          destinations: true
        });
        hasDestinationExpired = false;
      }
    },
    onInteractResponse({ destinations = [] } = {}) {
      console.log("Audiences:::onInteractResponse");
      destinations.forEach(dest => console.log(dest.url));
    }
  };
};
