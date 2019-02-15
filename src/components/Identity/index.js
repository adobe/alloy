import cookie from "@adobe/reactor-cookie";

export default () => {
  let hasIdSyncsExpired = true;

  return {
    namespace: "Identity",
    getEcid() {
      return cookie.get("ecid");
    },
    onBeforeCollect(payload) {
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
    },
    onInteractResponse({ ids: { ecid } }) {
      console.log("Identity:::onInteractResponse");
      cookie.set("ecid", ecid, { expires: 7 });
    }
  };
};
