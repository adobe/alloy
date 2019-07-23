import createLibraryInfo from "../../../../../src/components/LibraryInfo";

describe("LibraryInfo", () => {
  it("returns library information", () => {
    expect(createLibraryInfo().commands.getLibraryInfo()).toEqual({
      version: "{{version}}"
    });
  });
});
