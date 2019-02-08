
export default function Destinations() {
    let hasDestinationExpired = true;
    Object.defineProperty(this, "namespace", { get() { return "Destinations" } });

    this.onInteractRequest = (payload) => {
        console.log("Destinations:::onInteractRequest");
        if (hasDestinationExpired) {
            payload.appendToQuery({
                destinations: true
            });
            hasDestinationExpired = false;
        }
    };

    this.onResponseReady = ({ destinations = [] } = {}) => {
        console.log("Destinations:::onResponseReady");
        destinations.forEach(dest => console.log(dest.url));
    };
}
