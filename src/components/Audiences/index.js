export default function Audiences() {
  let hasDestinationExpired = true;
  Object.defineProperty(this, "namespace", {
    get() {
      return "Audiences";
    }
  });

  this.onBeforeInteract = payload => {
    console.log("Audiences:::onBeforeInteract");
    if (hasDestinationExpired) {
      payload.appendToQuery({
        destinations: true
      });
      hasDestinationExpired = false;
    }
  };

  this.onInteractResponse = ({ destinations = [] } = {}) => {
    console.log("Audiences:::onInteractResponse");
    destinations.forEach(dest => console.log(dest.url));
  };
}
