export default function Destinations() {
  let hasDestinationExpired = true;
  Object.defineProperty(this, "namespace", {
    get() {
      return "Destinations";
    }
  });

  this.onBeforeInteract = payload => {
    console.log("Destinations:::onBeforeInteract");
    if (hasDestinationExpired) {
      payload.appendToQuery({
        destinations: true
      });
      hasDestinationExpired = false;
    }
  };

  this.onInteractResponse = ({ destinations = [] } = {}) => {
    console.log("Destinations:::onInteractResponse");
    destinations.forEach(dest => console.log(dest.url));
  };
}
