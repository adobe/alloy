import cookie from "@adobe/reactor-cookie";
import migration from "../../../../../src/components/Identity/migration";

const AMCV_COOKIE_SAMPLE =
  "-1891778711|MCIDTS|18199|MCMID|83938241987308959172561495939786191343|MCAAMLH-1572973109|9|MCAAMB-1572973109|RKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y|MCOPTOUT-1572375509s|NONE|MCAID|NONE|MCSYNCSOP|411-18188|vVersion|2.4.0";
describe("Migration", () => {
  beforeEach(() => {
    cookie.remove("AMCV_TEST_ORG");
  });
  describe("readEcidFromAmcvCookie", () => {
    it("should return an empty string if no AMCV cookie is present", () => {
      const migrate = migration("TEST_ORG");
      expect(migrate.readEcidFromAmcvCookie()).toEqual("");
    });
    it("should return ECID if AMCV cookie has a part MCMID|value", () => {
      cookie.set("AMCV_TEST_ORG", "random|string|MCMID|1234|random|random");
      const migrate = migration("TEST_ORG");
      expect(migrate.readEcidFromAmcvCookie()).toEqual("1234");
    });
  });
  describe("createAmcvCookie", () => {
    it("should return an empty string if no AMCV cookie is present", () => {
      const migrate = migration("TEST_ORG");
      migrate.createAmcvCookie("1234");
      expect(cookie.get("AMCV_TEST_ORG")).toEqual("MCMID|1234");
    });
    it("should not write if an AMCV cookie is present", () => {
      cookie.set("AMCV_TEST_ORG", AMCV_COOKIE_SAMPLE);
      const migrate = migration("TEST_ORG");
      migrate.createAmcvCookie("1234");
      expect(cookie.get("AMCV_TEST_ORG")).toEqual(AMCV_COOKIE_SAMPLE);
    });
  });
});
