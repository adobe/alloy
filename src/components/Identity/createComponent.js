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

export default (processIdSyncs, config, logger, consent, eventManager) => {
  const { idMigrationEnabled, orgId } = config;
  const identityCookieName = getNamespacedCookieName(
    orgId,
    IDENTITY_COOKIE_KEY
  );
  let deferredForEcid;
  const migration = createMigration({ orgId, consent });
  const hasIdentityCookie = () => Boolean(cookieJar.get(identityCookieName));
  const customerIds = createCustomerIds({ eventManager, consent, logger });

  // TO-DOCUMENT: We wait for ECID before trigger any events.
  const accommodateIdentityOnRequest = payload => {
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
  };

  return {
    lifecycle: {
      onBeforeEvent({ event, payload }) {
        event.mergeQuery({
          identity: {
            fetch: [ecidNamespace]
          }
        });

        const configOverrides = {};

        if (config.idSyncEnabled !== undefined) {
          configOverrides.idSyncEnabled = config.idSyncEnabled;
        }

        if (config.idSyncContainerId !== undefined) {
          configOverrides.idSyncContainerId = config.idSyncContainerId;
        }

        if (Object.keys(configOverrides).length) {
          payload.mergeConfigOverrides({ identity: configOverrides });
        }
      },
      onBeforeDataCollectionRequest({ payload }) {
        return accommodateIdentityOnRequest(payload);
      },
      onBeforeConsentRequest({ payload }) {
        return accommodateIdentityOnRequest(payload);
      },
      onResponse({ response }) {
        const promises = [];
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
            promises.push(migration.createLegacyCookie(ecidPayload.value));
          }
        }

        // If we were queuing requests until we received the identity cookie,
        // and now we have the identity cookie, we can let the queued
        // requests go out. Technically, we should always have an identity
        // cookie at this point, but we check just to be sure.
        if (deferredForEcid && hasIdentityCookie()) {
          deferredForEcid.resolve();
        }

        promises.push(
          processIdSyncs(
            response.getPayloadsByType("identity:exchange"),
            logger
          )
        );

        return Promise.all(promises);
      }
    },
    commands: {
      setCustomerIds(options) {
        return customerIds.sync(options);
      }
    }
  };
};
