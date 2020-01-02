export default (description, transformer, specObjects) => {
  describe(description, () => {
    specObjects.forEach(({ value, expected = value, error }) => {
      if (error) {
        it(`rejects ${JSON.stringify(value)}`, () => {
          expect(() => transformer("mykey", value)).toThrowError();
        });
      } else {
        it(`transforms \`${JSON.stringify(value)}\` to \`${JSON.stringify(
          expected
        )}\``, () => {
          expect(transformer("mykey", value)).toEqual(expected || value);
        });
      }
    });
  });
};
