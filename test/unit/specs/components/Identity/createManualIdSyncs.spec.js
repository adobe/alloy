import createManualIdSyncs from "../../../../../src/components/Identity/createManualIdSyncs";

describe("Identity::createManualIdSyncs", () => {
  it("syncIdsByUrl throws an error if not all id syncs are valid", () => {
    const idSyncProcessor = {
      process: () => {},
      hasExpired: () => true
    };
    const manualIdSyncs = createManualIdSyncs(idSyncProcessor);
    const data = {
      idSyncs: [
        {
          type: "url",
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
            hideReferrer: false,
            ttlMinutes: 120
          }
        },
        {
          type: "url",
          id: "a",
          spec: {
            url:
              "//idsync.rlcdn.com/365868.gif?partner_uid=7965389961572730520429094229693001327a",
            hideReferrer: false,
            ttlMinutes: 120
          }
        },
        {
          type: "url",
          id: 502,
          spec: {
            url: 123,
            hideReferrer: false,
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
            hideReferrer: false,
            ttlMinutes: 120
          }
        }
      ]
    };

    return manualIdSyncs.syncIdsByUrl(data).catch(result => {
      expect(result.message).toEqual(
        "An invalid ID sync with the ID of 500 was passed to syncIdsByUrl."
      );
    });
  });

  it("syncIdsByUrl only processes if all id syncs are valid", () => {
    const idSyncProcessor = {
      process: idSyncs => {
        expect(idSyncs.length).toEqual(2);
        expect(idSyncs[0].spec.url).toEqual(
          "//idsync.rlcdn.com/365868.gif?partner_uid=79653899615727305204290942296930013271"
        );
        expect(idSyncs[1].spec.url).toEqual(
          "//idsync.rlcdn.com/365868.gif?partner_uid=79653899615727305204290942296930013274"
        );

        return Promise.resolve("success");
      },
      hasExpired: () => true
    };
    const manualIdSyncs = createManualIdSyncs(idSyncProcessor);
    const data = {
      idSyncs: [
        {
          type: "url",
          id: 501,
          spec: {
            url:
              "//idsync.rlcdn.com/365868.gif?partner_uid=79653899615727305204290942296930013271",
            hideReferrer: true,
            ttlMinutes: 120
          }
        },
        {
          type: "url",
          id: 504,
          spec: {
            url:
              "//idsync.rlcdn.com/365868.gif?partner_uid=79653899615727305204290942296930013274",
            hideReferrer: false,
            ttlMinutes: 120
          }
        }
      ]
    };

    return manualIdSyncs.syncIdsByUrl(data).then(result => {
      expect(result).toEqual("success");
    });
  });
});
