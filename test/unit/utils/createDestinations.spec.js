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
          url: "http://test.abc",
          hideReferrer: 1
        }
      }
    ];

    const urlDestinations = destinations
      .filter(dest => dest.type === "url")
      .map(dest => {
        const data = {
          id: dest.id
        };

        Object.assign(data, dest.spec);

        return data;
      });

    const destsUtil = createDestinations({ logger });

    destsUtil.fire(urlDestinations);
    destsUtil.destinationsProcessedPromise.then(firedDests => {
      expect(firedDests.errored[0].id).toEqual(2097728);
      expect(firedDests.errored[0].url).toEqual("http://test.abc");
      expect(firedDests.errored[0].hideReferrer).toEqual(1);
      expect(firedDests.errored[1]).toBeUndefined();
      expect(firedDests.loaded.length).toEqual(0);
      expect(firedDests.aborted.length).toEqual(0);
      expect(document.querySelectorAll(".adobe-iframe").length).toEqual(1);
      destsUtil.end();

      setTimeout(() => {
        expect(document.querySelectorAll(".adobe-iframe").length).toEqual(0);
      }, 0);
      done();
    });
  });
});
