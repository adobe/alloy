import { normalizeCustomerIds } from "./util";
import {
  crc32,
  convertBufferToHex,
  convertStringToSha256Buffer
} from "../../utils";
import { COOKIE_NAMES } from "./constants";

const { CUSTOMER_ID_HASH } = COOKIE_NAMES;

export default customerIds => {
  const normalizedCustomerIds = normalizeCustomerIds(customerIds);
  const checksum = crc32(JSON.stringify(normalizedCustomerIds)).toString(36);

  return {
    detectCustomerIdChange: cookieJar =>
      checksum !== cookieJar.get(CUSTOMER_ID_HASH),
    updateChecksum: cookieJar => cookieJar.set(CUSTOMER_ID_HASH, checksum),
    getNormalizedAndHashedIds: () => {
      const idNames = Object.keys(normalizedCustomerIds);
      const idsToHash = idNames.filter(idName => customerIds[idName].hash);
      const idHashPromises = idsToHash.map(id =>
        convertStringToSha256Buffer(normalizedCustomerIds[id].id)
      );
      return Promise.all(idHashPromises).then(hashedIds => {
        return hashedIds.reduce((normalizedIds, hashedId, index) => {
          normalizedIds[idsToHash[index]].id = convertBufferToHex(hashedId);
          return normalizedIds;
        }, normalizedCustomerIds);
      });
    }
  };
};
