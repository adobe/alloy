import createCorrelation from "../../../../src/components/Correlation";

const uuidv4Regex = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

describe("Correlation", () => {
  let uuid;

  beforeAll(() => {
    uuid = createCorrelation();
  });

  describe("commands", () => {
    describe("createCorrelationId", () => {
      it("returns a UUID v4-compliant ID", () => {
        expect(uuidv4Regex.test(uuid.commands.createCorrelationId())).toBe(
          true
        );
      });
    });
  });
});
