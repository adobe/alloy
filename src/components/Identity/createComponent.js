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
  let deferredForIdentityCookie;
  const migration = createMigration({ orgId, consent, logger });
  const hasIdentityCookie = () => Boolean(cookieJar.get(identityCookieName));
  const customerIds = createCustomerIds({ eventManager, consent, logger });

  // TO-DOCUMENT: We wait for ECID before trigger any events.
  const accommodateIdentityOnRequest = payload => {
    let promise;

    if (!hasIdentityCookie()) {
      if (deferredForIdentityCookie) {
        // We don't have an identity cookie, but the first request has
        // been sent to get it. We must wait for the response to the first
        // request to come back and a cookie set before we can let this
        // request go out.
        logger.log("Delaying request while retrieving ECID from server.");
        promise = deferredForIdentityCookie.promise.then(() => {
          logger.log("Resuming previously delayed request.");
        });
      } else {
        // For Alloy+Konductor communication to be as robust as possible and
        // to ensure we don't mint new ECIDs for requests that would otherwise
        // be sent in parallel, we'll let this request go out to fetch the
        // cookie, but we'll set up a promise so that future requests can
        // know when the cookie has been set.
        deferredForIdentityCookie = defer();

        // payload.expectsResponse() forces the request to go to the
        // /interact endpoint. Why can't we go to the /collect endpoint
        // to get the identity cookie?
        // There are a couple cases where first-party cookies can't be
        // set when hitting /collect:
        //
        // 1. If Alloy calls /collect when Konductor is on a different
        // domain (e.g., edge.adobedc.net), Konductor can't set cookies
        // on its own through HTTP headers and won't send a response body
        // so it can't tell Alloy to write a cookie on its behalf.
        // 2. Alloy may use sendBeacon() to send requests to /collect,
        // in which case the HTTP response will usually be ignored by
        // the browser.
        payload.expectResponse();

        if (idMigrationEnabled) {
          promise = migration.getEcidFromLegacy().then(ecidToMigrate => {
            if (ecidToMigrate) {
              addEcidToPayload(payload, ecidToMigrate);
            }
          });
        }

        if (
          config.thirdPartyCookiesEnabled &&
          areThirdPartyCookiesSupportedByDefault(getBrowser(window))
        ) {
          // If third-party cookies are enabled by the customer and
          // supported by the browser, we will send the request to a
          // a third-party identification domain that allows for more accurate
          // identification of the user through use of a third-party cookie.
          // If we have an ECID to migrate, we still want to hit the
          // third-party domain because the third-party identification domain
          // will use our ECID to set the third-party cookie if the third-party
          // cookie isn't already set, which provides for better cross-domain
          // identification for future requests.
          payload.useIdThirdPartyDomain();
        }
      }
    }

    customerIds.addToPayload(payload);
    return promise;
  };

  return {
    lifecycle: {
      onBeforeEvent({ event }) {
        event.mergeQuery({
          identity: {
            fetch: [ecidNamespace]
          }
        });
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
            promises.push(migration.createLegacyCookie(ecidPayload.id));
          }
        }

        // If we were queuing requests until we received the identity cookie,
        // and now we have the identity cookie, we can let the queued
        // requests go out. Technically, we should always have an identity
        // cookie at this point, but we check just to be sure.
        if (deferredForIdentityCookie && hasIdentityCookie()) {
          deferredForIdentityCookie.resolve();
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
