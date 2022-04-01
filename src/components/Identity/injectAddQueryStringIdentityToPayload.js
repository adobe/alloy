// Example: adobe_mc=TS%3D1641432103%7CMCMID%3D77094828402023918047117570965393734545%7CMCORGID%3DFAF554945B90342F0A495E2C%40AdobeOrg
// Decoded: adobe_mc=TS=1641432103|MCMID=77094828402023918047117570965393734545|MCORGID=FAF554945B90342F0A495E2C@AdobeOrg

import { queryString } from "../../utils";
import queryStringIdentityParam from "../../constants/queryStringIdentityParam";
import ecidNamespace from "../../constants/ecidNamespace";

const LINK_TTL_SECONDS = 300; // 5 minute link time to live

export default ({ locationSearch, dateProvider, orgId, logger }) => payload => {
  if (payload.hasIdentity(ecidNamespace)) {
    // don't overwrite a user provided ecid identity
    return;
  }

  const parsedQueryString = queryString.parse(locationSearch);
  const queryStringValue = parsedQueryString[queryStringIdentityParam];
  if (queryStringValue === undefined) {
    return;
  }

  const properties = queryStringValue.split("|").reduce((memo, keyValue) => {
    const [key, value] = keyValue.split("=");
    memo[key] = value;
    return memo;
  }, {});
  const ts = parseInt(properties.TS, 10);
  const mcmid = properties.MCMID;
  const mcorgid = properties.MCORGID;

  if (
    // When TS is not specified or not a number, the following inequality returns false.
    // All inequalities with NaN variables are false.
    dateProvider().getTime() / 1000 <= ts + LINK_TTL_SECONDS &&
    mcorgid === orgId &&
    mcmid
  ) {
    logger.info(`Adding ECID identity ${mcmid} to identityMap.`);
    payload.addIdentity(ecidNamespace, {
      id: mcmid
    });
  } else {
    logger.info("Detected invalid or expired adobe_mc query string parameter.");
  }
};
