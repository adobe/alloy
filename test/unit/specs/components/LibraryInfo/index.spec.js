import createLibraryInfo from "../../../../../src/components/LibraryInfo";

describe("LibraryInfo", () => {
  it("returns library information", () => {
    const alloyVersion = "__VERSION__";
    const extensionVersion = "__EXTENSION_VERSION__";
    expect(createLibraryInfo().commands.getLibraryInfo.run()).toEqual({
      libraryInfo: {
        version: `${alloyVersion}+${extensionVersion}`
      }
    });
  });
});
