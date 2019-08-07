import processIdSyncs from "../../../../../src/components/Identity/processIdSyncs";
import createCookie from "../../../../../src/core/createCookie";

const cookie = createCookie("willi", "123");
const ID_SYNC_CONTROL = "idSyncControl";

describe("Identity::processIdSyncs", () => {
  const config = {
    idSyncsEnabled: true
  };
  const logger = {
    log() {},
    error() {}
  };

  const getControlObject = () => {
    const val = cookie.get(ID_SYNC_CONTROL) || "";
    const arr = val ? val.split("_") : [];

    return arr.reduce((obj, pair) => {
      const o = obj;
      const [id, ts] = pair.split("-");

      o[id] = ts;

      return o;
    }, {});
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
      ID_SYNC_CONTROL,
      `123-${(Math.round(new Date().getTime() / 1000 / 60 / 60) - 10).toString(
        36
      )}`
    );

    let obj = getControlObject();

    expect(obj[123]).toBeDefined();
    processIdSyncs({ destinations: idSyncs, config, logger, cookie });

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
