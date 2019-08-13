import createIdSyncs from "../../../../../src/components/Identity/createIdSyncs";
import createCookieProxy from "../../../../../src/core/createCookieProxy";
import createComponentNamespacedCookieJar from "../../../../../src/core/createComponentNamespacedCookieJar";

const cookieProxy = createCookieProxy("identity", 180);
const cookieJar = createComponentNamespacedCookieJar(
  cookieProxy,
  "component_name"
);
const ID_SYNC_CONTROL = "idSyncControl";

describe("Identity::createIdSyncs", () => {
  const config = {
    idSyncsEnabled: true
  };
  const logger = {
    log() {},
    error() {}
  };

  const getControlObject = () => {
    const val = cookieJar.get(ID_SYNC_CONTROL) || "";
    const arr = val ? val.split("_") : [];

    return arr.reduce((obj, pair) => {
      const o = obj;
      const [id, ts] = pair.split("-");

      o[id] = ts;

      return o;
    }, {});
  };

  it("tracks id syncs", () => {
    const idsToSync = [
      {
        type: "url",
        id: 411,
        spec: {
          url:
            "//idsync.rlcdn.com/365868.gif?partner_uid=79653899615727305204290942296930013268",
          hideReferrer: 0
        }
      }
    ];

    cookieJar.set(
      ID_SYNC_CONTROL,
      `123-${(Math.round(new Date().getTime() / 1000 / 60 / 60) - 10).toString(
        36
      )}`
    );

    let obj = getControlObject();

    expect(obj[123]).toBeDefined();
    const idSyncs = createIdSyncs(config, logger, cookieJar);
    idSyncs.process(idsToSync);

    const checkCookie = () => {
      obj = getControlObject();

      if (obj[411] !== undefined) {
        expect(obj[123]).toBeUndefined();
      } else {
        setTimeout(checkCookie, 50);
      }
    };

    checkCookie();
  });
});
