import { cookieJar } from "../../../../../src/utils";
import createMigration from "../../../../../src/components/Identity/createMigration";

const identityCookieJar = {
  set() {},
  get() {},
  remove() {}
};
describe("createMigration(", () => {
  beforeEach(() => {
    cookieJar.remove("AMCV_TEST_ORG");
  });
  describe("getEcidFromLegacyCookie", () => {
    it("should not read AMCv cookie if idMigrationEnabled is false", () => {
      const migration = createMigration("TEST_ORG");
      expect(migration.getEcidFromLegacyCookie()).toEqual(null);
    });
    it("should return an empty string if no AMCV cookie is present", () => {
      const migration = createMigration("TEST_ORG", true);
      expect(migration.getEcidFromLegacyCookie()).toEqual(null);
    });

    [
      "random|string|MCMID|1234|random|random",
      "MCMID|1234|random|random",
      "random|random|MCMID|1234",
      "MCMID|1234"
    ].forEach(cookieValue => {
      it(`should return ECID if AMCV cookie is ${cookieValue}`, () => {
        cookieJar.set("AMCV_TEST_ORG", cookieValue);
        const migration = createMigration("TEST_ORG", true);
        expect(migration.getEcidFromLegacyCookie(identityCookieJar)).toEqual(
          "1234"
        );
      });
    });
  });
  describe("createAmcvCookie", () => {
    it("should not change AMCV cookie if idMigrationEnabled is false", () => {
      const previousCookieVal = cookieJar.get("AMCV_TEST_ORG");
      const migration = createMigration("TEST_ORG");
      migration.createAmcvCookie("1234");
      expect(cookieJar.get("AMCV_TEST_ORG")).toEqual(previousCookieVal);
    });
    it("should create an AMCV cookie with the value passed", () => {
      const migration = createMigration("TEST_ORG", true);
      migration.createAmcvCookie("1234");
      expect(cookieJar.get("AMCV_TEST_ORG")).toEqual("MCMID|1234");
    });
    it("should not write if an AMCV cookie is present", () => {
      const cookieValue =
        "-1891778711|MCIDTS|18199|MCMID|83938241987308959172561495939786191343|MCAAMLH-1572973109|9|MCAAMB-1572973109|RKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y|MCOPTOUT-1572375509s|NONE|MCAID|NONE|MCSYNCSOP|411-18188|vVersion|2.4.0";
      cookieJar.set("AMCV_TEST_ORG", cookieValue);
      const migration = createMigration("TEST_ORG", true);
      migration.createAmcvCookie("1234");
      expect(cookieJar.get("AMCV_TEST_ORG")).toEqual(cookieValue);
    });
  });
});
