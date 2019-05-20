import processIdSyncs from "../../../../src/components/Identity/processIdSyncs";
import { cookie } from "../../../../src/utils";
import namespace from "../../../../src/constants/namespace";

describe("Identity::processIdSyncs", () => {
  const config = {};
  const logger = {
    log() {},
    error() {}
  };

  const getControlObject = () => {
    return JSON.parse(cookie.get(`${namespace}idSyncControl`) || "{}");
  };

  it("tracks id syncs", done => {
    const idSyncs = [
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

    cookie.set(
      `${namespace}idSyncControl`,
      JSON.stringify({
        123: Math.round(new Date().getTime() / 1000 / 60 / 60) - 10
      }),
      {
        expires: 6 * 30 // 6 months
      }
    );

    let obj = getControlObject();

    expect(obj[123]).toBeDefined();
    processIdSyncs({ destinations: idSyncs, config, logger });

    const checkCookie = () => {
      obj = getControlObject();

      if (obj[411] !== undefined) {
        expect(obj[123]).toBeUndefined();
        done();
      } else {
        setTimeout(checkCookie, 50);
      }
    };

    checkCookie();
  });
});
