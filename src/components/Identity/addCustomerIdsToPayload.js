import { assign } from "../../utils";
import { validateCustomerIds } from "./util";
import processCustomerIds from "./processCustomerIds";

export default (ids, cookieJar, payload) => {
  validateCustomerIds(ids);
  const customerIds = assign({}, ids);
  const customerIdsProcess = processCustomerIds(customerIds);
  const customerIdChanged = customerIdsProcess.detectCustomerIdChange(
    cookieJar
  );
  return customerIdsProcess
    .getNormalizedAndHashedIds()
    .then(normalizedAndHashedIds => {
      const idNames = Object.keys(normalizedAndHashedIds);
      idNames.forEach(idName => {
        payload.addIdentity(idName, normalizedAndHashedIds[idName]);
      });
      payload.mergeMeta({ identity: { customerIdChanged } });
      if (customerIdChanged) {
        customerIdsProcess.updateChecksum(cookieJar);
      }
    });
};
