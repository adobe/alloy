import cookie from "@adobe/reactor-cookie";

export default function Identity() {
  var hasIdSyncsExpired = true;
  Object.defineProperty(this, "namespace", {
    get() {
      return "Identity";
    }
  });

  this.getEcid = () => {
    return cookie.get("ecid");
  };

  this.onBeforeCollect = payload => {
    console.log("Identity:::onBeforeCollect");
    if (hasIdSyncsExpired) {
      payload.appendToQuery({
        identity: {
          idSyncs: true,
          container_id: 7
        }
      });
      hasIdSyncsExpired = false;
    }
  };

  this.onInteractResponse = ({ ids: { ecid } }) => {
    console.log("Identity:::onInteractResponse");
    cookie.set("ecid", ecid, { expires: 7 });
  };
}
