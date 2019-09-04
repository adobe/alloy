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

    return arr.reduce((controlObject, idTimestampPair) => {
      const [id, timestamp] = idTimestampPair.split("-");

      controlObject[id] = parseInt(timestamp, 36);

      return controlObject;
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
          hideReferrer: 0,
          ttlMinutes: 120
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
    return idSyncs.process(idsToSync).then(() => {
      const now = Math.round(new Date().getTime() / 1000 / 60 / 60); // hours

      obj = getControlObject();
      expect(obj[411]).toBeDefined();
      expect(obj[411] - now).toEqual(2);
      expect(obj[123]).toBeUndefined();
    });
  });
});
