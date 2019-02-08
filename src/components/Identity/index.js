import cookie from "@adobe/reactor-cookie";

export default function Identity() {
    var hasIdSyncsExpired = true;
    Object.defineProperty(this, "namespace", { get() { return "Identity" } });

    this.getEcid = () => {
        return cookie.get("ecid");
    };

    this.willPrepareRequest = (payload) => {
        console.log("Identity:::willPrepareRequest");
        if (hasIdSyncsExpired) {
            payload.appendToQuery({
                identity: {
                    "idSyncs": true,
                    "container_id": 7
                }
            });
            hasIdSyncsExpired = false;
        }
    };

    this.onResponseReady = ({ ids: { ecid } }) => {
        console.log("Identity:::onResponseReady");
        cookie.set('ecid', ecid, { expires: 7 });
    };
}
