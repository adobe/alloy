import { Identity } from "../../utils/identityProtobuf.js";
import { getNamespacedCookieName } from "../../utils/index.js";

const base64ToBytes = (base64) => {
  const binString = atob(base64);
  return Uint8Array.from(binString, (m) => m.codePointAt(0));
}

export default ({ config, cookieJar }) => {
  const { orgId } = config;
  const kndctrCookieName = getNamespacedCookieName(orgId, "kndctr");
  /**
   * Returns the ECID from the kndctr cookie.
   * @returns {string|null}
   */
  return () => {
    const cookie = cookieJar.get(kndctrCookieName);
    if (!cookie) {
      return null;
    }
    const decodedCookie = decodeURIComponent(cookie)
      .replace(/_/g, "/")
      .replace(/-/g, "+");
    // cookie is a base64 encoded byte representation of a Identity protobuf message
    // and we need to get it to a Uint8Array in order to decode it

    const cookieBytes = base64ToBytes(decodedCookie);
    const message = Identity.decode(cookieBytes);
    return message.ecid;
  };
};
