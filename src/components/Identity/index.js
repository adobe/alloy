import cookie from "@adobe/reactor-cookie";

export default () => {
  let hasIdSyncsExpired = true;

  return {
    namespace: "Identity",
    lifecycle: {
      onBeforeEvent(payload) {
        console.log("Identity:::onBeforeEvent");
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
      onViewStartResponse({ ids: { ecid } }) {
        console.log("Identity:::onViewStartResponse");
        cookie.set("ecid", ecid, { expires: 7 });
      }
    },
    commands: {
      getEcid() {
        return cookie.get("ecid");
      }
    }
  };
};
