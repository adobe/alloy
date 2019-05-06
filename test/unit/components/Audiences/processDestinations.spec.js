import processDestinations from "../../../../src/components/Audiences/processDestinations";
import { cookie } from "../../../../src/utils";

describe("Audiences::processDestinations", () => {
  const config = {};
  const logger = {
    log() {},
    error() {}
  };

  it("sets cookie destinations", () => {
    const destinations = [
      {
        type: "url",
        id: 2097728,
        spec: {
          url: "http://test.abc",
          hideReferrer: 1
        }
      },
      {
        type: "cookie",
        spec: {
          name: "audlabcookie",
          value: "dgtest\u003ddevicegraphtestdestination1"
        }
      },
      {
        type: "cookie",
        spec: {
          name: "testCookieDestination",
          value: "destination\u003ds2",
          domain: "",
          ttl: 30
        }
      },
      {
        type: "url",
        id: 2097729,
        spec: {
          url: "http://test.zyx",
          hideReferrer: 0
        }
      }
    ];

    processDestinations({ destinations, config, logger });

    expect(cookie.get("audlabcookie")).toEqual(
      "dgtest\u003ddevicegraphtestdestination1"
    );
    expect(cookie.get("testCookieDestination")).toEqual("destination\u003ds2");
  });
});
