import createDestinations from "../../../src/utils/createDestinations";

describe("createDestinations", () => {
  const logger = {
    log() {},
    error() {}
  };

  it("fires url destinations", done => {
    const destinations = [
      {
        type: "url",
        id: 2097728,
        spec: {
          url: "http://www.adobe.com?def=456",
          hideReferrer: 1
        }
      }
    ];

    const urlDestinations = destinations
      .filter(dest => dest.type === "url")
      .map(dest =>
        Object.assign(
          {
            id: dest.id
          },
          dest.spec
        )
      );

    const destsUtil = createDestinations({ logger });

    destsUtil.fire(urlDestinations);
    destsUtil.destinationsProcessedPromise.then(firedDests => {
      expect(firedDests.errored[0].id).toEqual(2097728);
      expect(firedDests.errored[0].url).toEqual("http://www.adobe.com?def=456");
      expect(firedDests.errored[0].hideReferrer).toEqual(1);
      expect(firedDests.errored[1]).toBeUndefined();
      expect(firedDests.loaded.length).toEqual(0);
      expect(firedDests.aborted.length).toEqual(0);
      done();
    });
  });
});
