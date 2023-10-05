import createIndexedDB from "../../../../../src/components/DecisioningEngine/createIndexedDB";

describe("DecisioningEngine:createIndexedDB", () => {
  let indexedDB;

  beforeAll(async () => {
    indexedDB = createIndexedDB();
    await indexedDB.setupIndexedDB();
  });

  afterAll(async () => {
    await indexedDB.clearIndexedDB();
    indexedDB.getIndexDB().close();
  });

  it("should add an event to the database", async () => {
    const eventType = "display";
    const eventId = "xyz123";
    const action = "click";

    const result = await indexedDB.addRecord({}, eventType, eventId, action);
    expect(result).toBeTruthy();
  });

  it("should get events from the database if that exist", async () => {
    const eventType = "display";
    const eventId = "xyz123";

    const events = await indexedDB.getRecords(eventType, eventId);
    expect(Array.isArray(events)).toBe(true);
  });

  it("should return empty if the query is not found", async () => {
    const eventType = "someMagicalEvent";
    const eventId = "someFutureId";

    const events = await indexedDB.getRecords(eventType, eventId);
    expect(events.length).toBe(0);
  });
});
