import createCustomerIds from "./customerIds/createCustomerIds";
import { defer, cookieJar, getNamespacedCookieName } from "../../utils";
import { IDENTITY_COOKIE_KEY } from "../../constants/cookieDetails";
import areThirdPartyCookiesSupported from "../../utils/areThirdPartyCookiesSupported";
import getBrowser from "../../utils/getBrowser";

export default (config, logger, optIn, eventManager) => {
  const { orgId } = config;
  const identityCookieName = getNamespacedCookieName(
    orgId,
    IDENTITY_COOKIE_KEY
  );
  let deferredForEcid;
  // TODO: Reimplement ID syncs
  // let alreadyQueriedForIdSyncs = false;

  // TODO: Fetch from server if ECID is not available.
  const getEcid = () => {
    const ecid = cookieJar.get(identityCookieName);
    return ecid;
  };

  // #if _REACTOR
  // This is a way for the ECID data element in the Reactor extension
  // to get the ECID synchronously since data elements are required
  // to be synchronous.
  config.reactorRegisterGetEcid(() => {
    return optIn.isOptedIn() ? getEcid() : undefined;
  });
  // #endif

  const customerIds = createCustomerIds(eventManager);

  return {
    lifecycle: {
      // Waiting for opt-in because we'll be reading the ECID from a cookie
      onBeforeEvent({ event }) {
        return optIn.whenOptedIn().then(() => {
          const identityQuery = {
            identity: {}
          };
          let sendIdentityQuery = false;

          // TODO: Reimplement ID syncs
          // if (
          //   !alreadyQueriedForIdSyncs &&
          //   config.idSyncEnabled &&
          //   idSyncs.hasExpired()
          // ) {
          //   alreadyQueriedForIdSyncs = true;
          //   identityQuery.identity.exchange = true;
          //   sendIdentityQuery = true;
          //
          //   if (config.idSyncContainerId !== undefined) {
          //     identityQuery.identity.containerId = config.idSyncContainerId;
          //   }
          // }

          if (!config.thirdPartyCookiesEnabled) {
            identityQuery.identity.thirdPartyCookiesEnabled = false;
            sendIdentityQuery = true;
          }

          if (sendIdentityQuery) {
            event.mergeQuery(identityQuery);
          }
        });
      },
      // Waiting for opt-in because we'll be reading the ECID from a cookie
      // TO-DOCUMENT: We wait for ECID before trigger any events.
      onBeforeDataCollection({ payload }) {
        return optIn.whenOptedIn().then(() => {
          const ecid = getEcid();

          let promise;

          if (!ecid) {
            if (deferredForEcid) {
              // We don't have an ECID, but the first request has gone out to
              // fetch it. We must wait for the response to come back with the
              // ECID before we can apply it to this payload.
              logger.log("Delaying request while retrieving ECID from server.");
              promise = deferredForEcid.promise.then(() => {
                logger.log("Resuming previously delayed request.");
              });
            } else {
              // We don't have an ECID and no request has gone out to fetch it.
              // We won't apply the ECID to this request, but we'll set up a
              // promise so that future requests can know when the ECID has returned.
              deferredForEcid = defer();
              payload.expectResponse();
              if (
                config.thirdPartyCookiesEnabled &&
                areThirdPartyCookiesSupported(getBrowser(window))
              ) {
                payload.useIdThirdPartyDomain();
              }
            }
          }

          customerIds.addToPayload(payload);
          return promise;
        });
      },

      // Waiting for opt-in because we'll be reading the ECID from a cookie
      onResponse() {
        return optIn.whenOptedIn().then(() => {
          if (getEcid()) {
            if (deferredForEcid) {
              deferredForEcid.resolve();
            }
          }

          // TODO: Reimplement ID syncs
          // idSyncs.process(response.getPayloadsByType("identity:exchange"));
        });
      }
    },
    commands: {
      getEcid() {
        return optIn.whenOptedIn().then(getEcid);
      },
      setCustomerIds(options) {
        return optIn.whenOptedIn().then(() => customerIds.sync(options));
      }
    }
  };
};
