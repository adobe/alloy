import computeConsentHash from "./computeConsentHash";

const getKey = ({ standard, version }) => {
  return `${standard}.${version}`;
};

export default ({ storage }) => {
  return {
    clear() {
      storage.clear();
    },
    lookup(consentObjects) {
      const currentHashes = {};
      const getCurrentHash = consentObject => {
        const key = getKey(consentObject);
        const { standard, version, ...rest } = consentObject;
        if (!currentHashes[key]) {
          currentHashes[key] = `${computeConsentHash(rest)}`;
        }
        return currentHashes[key];
      };

      return {
        isNew() {
          return consentObjects.some(consentObject => {
            const key = getKey(consentObject);
            const previousHash = storage.getItem(key);
            return (
              previousHash === null ||
              previousHash !== getCurrentHash(consentObject)
            );
          });
        },
        save() {
          consentObjects.forEach(consentObject => {
            const key = getKey(consentObject);
            storage.setItem(key, getCurrentHash(consentObject));
          });
        }
      };
    }
  };
};
