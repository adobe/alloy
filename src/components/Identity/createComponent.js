import createCustomerIds from "./customerIds/createCustomerIds";
import { defer } from "../../utils";
import { EXPERIENCE_CLOUD_ID } from "./constants/cookieNames";
import createMigration from "./createMigration";
import areThirdPartyCookiesSupported from "../../utils/areThirdPartyCookiesSupported";
import getBrowser from "../../utils/getBrowser";

const addIdsContext = (payload, ecid) => {
  payload.addIdentity(EXPERIENCE_CLOUD_ID, {
    id: ecid
  });
};

export default (
  idSyncs,
  manualIdSyncs,
  config,
  logger,
  cookieJar,
  optIn,
  eventManager
) => {
  let deferredForEcid;
  let alreadyQueriedForIdSyncs = false;
  const { migrateIds, imsOrgId } = config;
  const migration = createMigration(imsOrgId, migrateIds);

  // TODO: Fetch from server if ECID is not available.
  const getEcid = () => {
    const ecid =
      cookieJar.get(EXPERIENCE_CLOUD_ID) ||
      migration.getEcidFromAmcvCookie(cookieJar);
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

  const customerIds = createCustomerIds(cookieJar, eventManager);

  return {
    lifecycle: {
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
          const ecid = getEcid();

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
              addIdsContext(payload, getEcid());
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
          customerIds.addToPayload(payload);
          return promise;
        });
      },

      // Waiting for opt-in because we'll be writing the ECID to a cookie
      onResponse({ response }) {
        return optIn.whenOptedIn().then(() => {
          const ecidPayloads = response.getPayloadsByType("identity:persist");

          if (ecidPayloads.length > 0) {
            const ecid = ecidPayloads[0].id;
            cookieJar.set(EXPERIENCE_CLOUD_ID, ecid);
            migration.createAmcvCookie(ecid);
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
