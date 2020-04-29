import { normalizeIdentities, validateIdentities } from "./util";
import { convertBufferToHex, clone, noop, isEmptyObject } from "../../../utils";

export default ({
  eventManager,
  consent,
  logger,
  convertStringToSha256Buffer
}) => {
  const hash = (originalIdentities, normalizedIdentities) => {
    const namespaces = Object.keys(normalizedIdentities);
    const namespacesToHash = namespaces.filter(
      namespace => originalIdentities[namespace].hashEnabled
    );
    const idHashPromises = namespacesToHash.map(namespace =>
      convertStringToSha256Buffer(
        normalizedIdentities[namespace].id.trim().toLowerCase()
      )
    );
    return Promise.all(idHashPromises).then(hashedIds => {
      return hashedIds.reduce((finalIdentities, hashedId, index) => {
        if (!hashedId) {
          delete finalIdentities[namespacesToHash[index]];
          logger.warn(
            `Unable to hash identity ${namespacesToHash[index]} due to lack of browser support. Provided ${namespacesToHash[index]} will not be sent to Adobe Experience Cloud.`
          );
        } else {
          finalIdentities[namespacesToHash[index]].id = convertBufferToHex(
            hashedId
          );
        }
        return finalIdentities;
      }, normalizedIdentities);
    });
  };

  const state = {
    identities: {},
    hasIdentities: false
  };
  const setState = normalizedIdentities => {
    state.identities = {
      ...state.identities,
      ...normalizedIdentities
    };
    state.hasIdentities = !!Object.keys(state.identities).length;
  };
  const identityManager = {
    addToPayload(payload) {
      if (state.hasIdentities) {
        const identities = clone(state.identities);
        Object.keys(identities).forEach(namespace => {
          payload.addIdentity(namespace, identities[namespace]);
        });
      }
    },
    sync(originalIdentities) {
      validateIdentities(originalIdentities);

      const normalizedIdentities = normalizeIdentities(originalIdentities);

      return hash(originalIdentities, normalizedIdentities).then(
        hashedIdentities => {
          if (isEmptyObject(hashedIdentities)) {
            return false;
          }
          setState(hashedIdentities);
          const event = eventManager.createEvent();
          return consent.awaitConsent().then(() => {
            // FIXME: Konductor shouldn't require an event.
            // we're now returning an object at onResponse
            // here we need to add 'then(noop)' because we are not returning a value
            return eventManager.sendEvent(event).then(noop);
          });
        }
      );
    }
  };

  return identityManager;
};
