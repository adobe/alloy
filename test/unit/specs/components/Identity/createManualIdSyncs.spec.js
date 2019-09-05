import createCookieProxy from "../../../../../src/core/createCookieProxy";
import createComponentNamespacedCookieJar from "../../../../../src/core/createComponentNamespacedCookieJar";
import createManualIdSyncs from "../../../../../src/components/Identity/createManualIdSyncs";

const cookieProxy = createCookieProxy("identity", 180);
const cookieJar = createComponentNamespacedCookieJar(
  cookieProxy,
  "component_name"
);
const config = {
  idSyncsEnabled: true
};
const logger = {
  log() {},
  error() {}
};
const manualIdSyncs = createManualIdSyncs(config, logger, cookieJar);

describe("Identity::createManualIdSyncs", () => {
  it("syncIdsByUrl throws an error if not all id syncs are valid", () => {
    const data = {
      idSyncs: [
        {
          id: 500,
          spec: {
            url:
              "//idsync.rlcdn.com/365868.gif?partner_uid=79653899615727305204290942296930013270",
            hideReferrer: 0,
            ttlMinutes: 120
          }
        },
        {
          type: "url",
          id: 501,
          spec: {
            url:
              "//idsync.rlcdn.com/365868.gif?partner_uid=79653899615727305204290942296930013271",
            hideReferrer: 0,
            ttlMinutes: 120
          }
        },
        {
          type: "url",
          id: "a",
          spec: {
            url:
              "//idsync.rlcdn.com/365868.gif?partner_uid=7965389961572730520429094229693001327a",
            hideReferrer: 0,
            ttlMinutes: 120
          }
        },
        {
          type: "url",
          id: 502,
          spec: {
            url: 123,
            hideReferrer: 0,
            ttlMinutes: 120
          }
        },
        {
          type: "url",
          id: 503,
          spec: {
            url:
              "//idsync.rlcdn.com/365868.gif?partner_uid=79653899615727305204290942296930013273",
            hideReferrer: 255,
            ttlMinutes: 120
          }
        },
        {
          type: "url",
          id: 504,
          spec: {
            url:
              "//idsync.rlcdn.com/365868.gif?partner_uid=79653899615727305204290942296930013274",
            hideReferrer: 0,
            ttlMinutes: 120
          }
        }
      ]
    };

    return manualIdSyncs.syncIdsByUrl(data).catch(result => {
      expect(result.message).toEqual(
        "syncIdsByUrl was passed one or more invalid id syncs."
      );
    });
  });

  it("syncIdsByUrl only processes if all id syncs are valid", () => {
    const data = {
      idSyncs: [
        {
          type: "url",
          id: 501,
          spec: {
            url:
              "//idsync.rlcdn.com/365868.gif?partner_uid=79653899615727305204290942296930013271",
            hideReferrer: 0,
            ttlMinutes: 120
          }
        },
        {
          type: "url",
          id: 504,
          spec: {
            url:
              "//idsync.rlcdn.com/365868.gif?partner_uid=79653899615727305204290942296930013274",
            hideReferrer: 0,
            ttlMinutes: 120
          }
        }
      ]
    };

    return manualIdSyncs.syncIdsByUrl(data).then(result => {
      expect(result.succeeded.length).toEqual(2);
      expect(result.succeeded[0].url).toEqual(
        "//idsync.rlcdn.com/365868.gif?partner_uid=79653899615727305204290942296930013271"
      );
      expect(result.succeeded[1].url).toEqual(
        "//idsync.rlcdn.com/365868.gif?partner_uid=79653899615727305204290942296930013274"
      );
    });
  });
});
