import createGetPageLocation from "../../utils/dom/createGetPageLocation.js";
import {buildPageSurface} from "../../utils/surfaceUtils.js";
import {cookieJar, sanitizeOrgIdForCookieName} from "../../utils/index.js";
import COOKIE_NAME_PREFIX from "../../constants/cookieNamePrefix.js";

export const getPageSurface = () => {
  const pageLocation = createGetPageLocation({window: window});
  return buildPageSurface(pageLocation);
};

const getECID_cookie = ({loggingCookieJar, config}) => {
  const cookieName = getEcidCookieName(config);

  return loggingCookieJar.get(cookieName);
}

const getEcidCookieName = (config) => {
  const sanitizedOrgId = sanitizeOrgIdForCookieName(config.orgId);
  return `${COOKIE_NAME_PREFIX}_${sanitizedOrgId}_${IDENTITY_COOKIE_NAME}`;
};
const getConciergeSessionCookieName = (config) => {
  const sanitizedOrgId = sanitizeOrgIdForCookieName(config.orgId);
  return `${COOKIE_NAME_PREFIX}_${sanitizedOrgId}_${BC_SESSION_COOKIE_NAME}`;
};
const createConciergeSessionCookieName = (name, value, maxAge, sameSite= true) => {

  const options = {};

  if (maxAge !== undefined) {
    // cookieJar expects "expires" as a date object
    options.expires = new Date(
      (new Date()).getTime() + maxAge * 1000,
    );
  }
  if (sameSite !== undefined) {
    options.sameSite = sameSite;
  }
  try{
    cookieJar.set(
      name,
      value,
      options
    );
  }catch(e){
    console.log(e);
  }

};
const getConciergeSessionCookie = ({loggingCookieJar, config}) => {
  const cookieName = getConciergeSessionCookieName(config);
  return loggingCookieJar.get(cookieName);
}
