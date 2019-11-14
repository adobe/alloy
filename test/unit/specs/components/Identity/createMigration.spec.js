import { cookieJar } from "../../../../../src/utils";
import createMigration from "../../../../../src/components/Identity/createMigration";

const AMCV_COOKIE_SAMPLE =
  "-1891778711|MCIDTS|18199|MCMID|83938241987308959172561495939786191343|MCAAMLH-1572973109|9|MCAAMB-1572973109|RKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y|MCOPTOUT-1572375509s|NONE|MCAID|NONE|MCSYNCSOP|411-18188|vVersion|2.4.0";
const identityCookieJar = {
  set() {},
  get() {},
  remove() {}
};
describe("createMigration(", () => {
  beforeEach(() => {
    cookieJar.remove("AMCV_TEST_ORG");
  });
  describe("getEcidFromAmcvCookie", () => {
    it("should not read AMCv cookie if idMigrationEnabled is false", () => {
      const migration = createMigration("TEST_ORG");
      expect(migration.getEcidFromAmcvCookie()).toEqual(undefined);
    });
    it("should return an empty string if no AMCV cookie is present", () => {
      const migration = createMigration("TEST_ORG", true);
      expect(migration.getEcidFromAmcvCookie()).toEqual(null);
    });
    it("should return ECID if AMCV cookie has a part MCMID|value", () => {
      cookieJar.set("AMCV_TEST_ORG", "random|string|MCMID|1234|random|random");
      const migration = createMigration("TEST_ORG", true);
      expect(migration.getEcidFromAmcvCookie(identityCookieJar)).toEqual(
        "1234"
      );
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
      cookieJar.set("AMCV_TEST_ORG", AMCV_COOKIE_SAMPLE);
      const migration = createMigration("TEST_ORG", true);
      migration.createAmcvCookie("1234");
      expect(cookieJar.get("AMCV_TEST_ORG")).toEqual(AMCV_COOKIE_SAMPLE);
    });
  });
});
