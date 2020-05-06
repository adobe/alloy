import createLibraryInfo from "../../../../../src/components/LibraryInfo";

describe("LibraryInfo", () => {
  it("returns library information", () => {
    expect(createLibraryInfo().commands.getLibraryInfo.run()).toEqual({
      libraryInfo: {
        version: "{{version}}"
      }
    });
  });
});
