import createCustomerIds from "./customerIds/createCustomerIds";
import { defer } from "../../utils";
import { COOKIE_NAMES } from "./constants";
import migration from "./migration";
import createEvent from "../DataCollector/createEvent";

const { EXPERIENCE_CLOUD_ID } = COOKIE_NAMES;
const addIdsContext = (payload, ecid) => {
  payload.addIdentity(EXPERIENCE_CLOUD_ID, {
    id: ecid
  });
};

export default (idSyncs, manualIdSyncs, cookieJar, config, logger, network) => {
  let optIn;
  let deferredForEcid;
  let lifecycle;
  let customerIds;
  let alreadyQueriedForIdSyncs = false;
  const { migrateIds, imsOrgId } = config;
  const createPayload = event => {
    const payload = network.createPayload();
    payload.addEvent(event);
    return payload;
  };

  const readEcid = () => {
    let ecid = cookieJar.get(EXPERIENCE_CLOUD_ID);
    if (!ecid && migrateIds) {
      ecid = migration(imsOrgId).readEcidFromAmcvCookie();
    }
    return ecid;
  };

  const makeServerCall = payload => {
    return lifecycle.onBeforeDataCollection({ payload }).then(() => {
      return network.sendRequest(payload, payload.expectsResponse);
    });
  };

  const createEcidEvent = () => {
    const event = createEvent();
    const payload = createPayload(event);

    return lifecycle
      .onBeforeEvent({
        event,
        options: {},
        isViewStart: false,
        documentUnloading: false
      }) // FIXME: We shouldn't need an event.
      .then(() => optIn.whenOptedIn())
      .then(() => makeServerCall(payload));
  };

  const getEcid = () => {
    const ecid = readEcid();
    if (ecid) {
      return ecid;
    }
    return createEcidEvent();
  };

  return {
    lifecycle: {
      onComponentsRegistered(tools) {
        ({ lifecycle, optIn } = tools);
        if (migrateIds) {
          getEcid(migrateIds);
        }
        customerIds = createCustomerIds(cookieJar, lifecycle, network, optIn);

        // #if _REACTOR
        // This is a way for the ECID data element in the Reactor extension
        // to get the ECID synchronously since data elements are required
        // to be synchronous.
        config.reactorRegisterGetEcid(() => {
          return optIn.isOptedIn() ? getEcid() : undefined;
        });
        // #endif
      },
      // Waiting for opt-in because we'll be reading the ECID from a cookie
      onBeforeEvent({ event }) {
        return optIn.whenOptedIn().then(() => {
          const identityQuery = {
            identity: {}
          };
          let sendIdentityQuery = false;

          if (
            !alreadyQueriedForIdSyncs &&
            config.idSyncEnabled &&
            idSyncs.hasExpired()
          ) {
            alreadyQueriedForIdSyncs = true;
            identityQuery.identity.exchange = true;
            sendIdentityQuery = true;

            if (config.idSyncContainerId !== undefined) {
              identityQuery.identity.containerId = config.idSyncContainerId;
            }
          }

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
          let ecid = readEcid(migrateIds);
          let promise;

          if (ecid) {
            addIdsContext(payload, ecid);
          } else if (deferredForEcid) {
            // We don't have an ECID, but the first request has gone out to
            // fetch it. We must wait for the response to come back with the
            // ECID before we can apply it to this payload.
            logger.log("Delaying request while retrieving ECID from server.");
            promise = deferredForEcid.promise.then(() => {
              logger.log("Resuming previously delayed request.");
              addIdsContext(payload, readEcid());
            });
          } else {
            // We don't have an ECID and no request has gone out to fetch it.
            // We won't apply the ECID to this request, but we'll set up a
            // promise so that future requests can know when the ECID has returned.
            deferredForEcid = defer();
            if (migrateIds) {
              promise = deferredForEcid.promise.then(() => {
                logger.log("Resuming previously delayed request.");
                addIdsContext(payload, readEcid());
              });
              migration(imsOrgId)
                .getEcidFromDemdex()
                .then(idFromDemdex => {
                  ecid = idFromDemdex;
                  cookieJar.set(EXPERIENCE_CLOUD_ID, ecid);
                  deferredForEcid.resolve();
                });
            } else {
              payload.expectResponse();
            }
          }
          customerIds.addToPayload(payload);
          return promise;
        });
      },
      // Waiting for opt-in because we'll be writing the ECID to a cookie
      onResponse({ response }) {
        return optIn.whenOptedIn().then(() => {
          const ecidPayloads = response.getPayloadsByType("identity:persist");

          if (ecidPayloads.length > 0 && !migrateIds) {
            cookieJar.set(EXPERIENCE_CLOUD_ID, ecidPayloads[0].id);

            if (deferredForEcid) {
              deferredForEcid.resolve();
            }
          }

          idSyncs.process(response.getPayloadsByType("identity:exchange"));
        });
      }
    },
    commands: {
      getEcid() {
        return optIn.whenOptedIn().then(getEcid);
      },
      setCustomerIds(options) {
        return optIn.whenOptedIn().then(() => customerIds.sync(options));
      },
      syncIdsByUrl(options) {
        return optIn
          .whenOptedIn()
          .then(() => manualIdSyncs.syncIdsByUrl(options));
      }
    }
  };
};
