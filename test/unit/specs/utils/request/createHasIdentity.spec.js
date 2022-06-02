import {
  createHasIdentity,
  createAddIdentity
} from "../../../../../src/utils/request";

describe("createHasIdentity", () => {
  let content;
  let hasIdentity;
  let addIdentity;

  beforeEach(() => {
    content = {};
    hasIdentity = createHasIdentity(content);
    addIdentity = createAddIdentity(content);
  });

  it("should return false when no xdm has been set", () => {
    expect(hasIdentity("myid")).toBe(false);
  });
  it("should return false if no identity has been set", () => {
    content.xdm = {};
    expect(hasIdentity("myid")).toBe(false);
  });
  it("should return false if there are other identities", () => {
    addIdentity("other", "myotherid");
    expect(hasIdentity("myid")).toBe(false);
  });
  it("should return true when there already is an identity", () => {
    addIdentity("myid", "myidvalue");
    expect(hasIdentity("myid")).toBe(true);
  });
});
