import fireDestinations from "../../../src/utils/fireDestinations";

describe("fireDestinations", () => {
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

    fireDestinations({ logger, destinations: urlDestinations }).then(
      firedDests => {
        expect(firedDests.failed[0].id).toEqual(2097728);
        expect(firedDests.failed[0].url).toEqual(
          "http://www.adobe.com?def=456"
        );
        expect(firedDests.failed[0].hideReferrer).toEqual(1);
        expect(firedDests.failed.length).toEqual(1);
        expect(firedDests.succeeded.length).toEqual(0);
        done();
      }
    );
  });
});
