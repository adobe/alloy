import { sha256Buffer, normalizeCustomerIds, bufferToHex } from "./util";
import { crc32 } from "../../utils";
import { COOKIE_NAMES } from "./constants";

const { CUSTOMER_ID_HASH } = COOKIE_NAMES;

export default customerIds => {
  const normalizedCustomerIds = normalizeCustomerIds(customerIds);
  const checkSum = crc32(JSON.stringify(normalizedCustomerIds)).toString(36);

  return {
    detectCustomerIdChange: cookieJar =>
      checkSum !== cookieJar.get(CUSTOMER_ID_HASH),
    updateCheckSum: cookieJar => cookieJar.set(CUSTOMER_ID_HASH, checkSum),
    getNormalizedAndHashedIds: () => {
      const idNames = Object.keys(normalizedCustomerIds);
      const idsToHash = idNames.filter(idName => customerIds[idName].hash);
      const idHashPromises = idsToHash.map(id =>
        sha256Buffer(normalizedCustomerIds[id].id)
      );
      return Promise.all(idHashPromises).then(hashedIds => {
        return hashedIds.reduce((normalizedIds, hashedId, index) => {
          normalizedIds[idsToHash[index]].id = bufferToHex(hashedId);
          return normalizedIds;
        }, normalizedCustomerIds);
      });
    }
  };
};
