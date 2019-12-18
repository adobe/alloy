import createCustomerIds from "./customerIds/createCustomerIds";
import {
  defer,
  cookieJar,
  getNamespacedCookieName,
  areThirdPartyCookiesSupportedByDefault,
  find
} from "../../utils";
import { IDENTITY_COOKIE_KEY } from "../../constants/cookieDetails";
import getBrowser from "../../utils/getBrowser";
import createMigration from "./createMigration";
import ecidNamespace from "../../constants/ecidNamespace";

const addEcidToPayload = (payload, ecid) => {
  payload.addIdentity(ecidNamespace, {
    id: ecid
  });
};

export default (processIdSyncs, config, logger, optIn, eventManager) => {
  const { idMigrationEnabled, orgId } = config;
  const identityCookieName = getNamespacedCookieName(
    orgId,
    IDENTITY_COOKIE_KEY
  );
  let deferredForEcid;
  const migration = createMigration(orgId);
  const hasIdentityCookie = () => Boolean(cookieJar.get(identityCookieName));
  const customerIds = createCustomerIds(eventManager);

  return {
    lifecycle: {
      // Waiting for opt-in because we'll be reading the ECID from a cookie
      onBeforeEvent({ event }) {
        return optIn.whenOptedIn().then(() => {
          const identityQuery = {
            fetch: [ecidNamespace]
          };
          const configOverridesMeta = {};

          if (config.idSyncEnabled) {
            configOverridesMeta.idSync = {
              enabled: true
            };
            if (config.containerId !== undefined) {
              configOverridesMeta.idSync.containerId = 40;
            }
          }

          event.mergeQuery({
            identity: identityQuery
          });
          event.mergeMeta({
            configOverrides: configOverridesMeta
          });
        });
      },
      // Waiting for opt-in because we'll be reading the ECID from a cookie
      // TO-DOCUMENT: We wait for ECID before trigger any events.
      onBeforeDataCollection({ payload }) {
        return optIn.whenOptedIn().then(() => {
          let promise;

          if (!hasIdentityCookie()) {
            const ecidToMigrate =
              idMigrationEnabled && migration.getEcidFromLegacyCookies();

            if (ecidToMigrate) {
              // We don't have an identity cookie, but we do have an ECID
              // from a legacy cookie that we can explicitly provide
              // to the server, which is sufficient until the identity cookie
              // gets set.
              addEcidToPayload(payload, ecidToMigrate);
            } else if (deferredForEcid) {
              // We don't have an identity cookie, but the first request has
              // been sent to get it. We must wait for the response to the first
              // request to come back and a cookie set before we can let this
              // request go out.
              logger.log("Delaying request while retrieving ECID from server.");
              promise = deferredForEcid.promise.then(() => {
                logger.log("Resuming previously delayed request.");
              });
            } else {
              // We don't have an identity cookie and no request has gone out
              // to get it. We'll let this request go out to fetch the cookie,
              // but we'll set up a promise so that future requests can
              // know when the cookie has been set. We don't let additional
              // requests to go out in the meantime because a new ECID would
              // be minted for each request (each request would be seen as a
              // new visitor).
              deferredForEcid = defer();
              payload.expectResponse();
              // If third-party cookies are enabled by the customer and
              // supported by the browser, we will send the request to a
              // a third-party domain that allows for more accurate
              // identification of the user through use of a third-party cookie.
              if (
                config.thirdPartyCookiesEnabled &&
                areThirdPartyCookiesSupportedByDefault(getBrowser(window))
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
      onResponse({ response }) {
        return optIn.whenOptedIn().then(() => {
          if (idMigrationEnabled) {
            const identityResultPayloads = response.getPayloadsByType(
              "identity:result"
            );

            const ecidPayload = find(
              identityResultPayloads,
              payload =>
                payload.namespace && payload.namespace.code === ecidNamespace
            );

            if (ecidPayload) {
              migration.createLegacyCookie(ecidPayload.id);
            }
          }

          // If we were queuing requests until we received the identity cookie,
          // and now we have the identity cookie, we can let the queued
          // requests go out. Technically, we should always have an identity
          // cookie at this point, but we check just to be sure.
          if (deferredForEcid && hasIdentityCookie()) {
            deferredForEcid.resolve();
          }

          return processIdSyncs(
            response.getPayloadsByType("identity:exchange"),
            logger
          );
        });
      }
    },
    commands: {
      setCustomerIds(options) {
        return optIn
          .whenOptedIn()
          .then(() => customerIds.sync(options, logger));
      }
    }
  };
};
