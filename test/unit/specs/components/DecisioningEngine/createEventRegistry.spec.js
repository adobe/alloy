import createEventRegistry from "../../../../../src/components/DecisioningEngine/createEventRegistry";

describe("DecisioningEngine:createEventRegistry", () => {
  it("registers events", () => {
    const eventRegistry = createEventRegistry();

    const getContent = () => ({
      xdm: {
        eventType: "display",
        _experience: {
          decisioning: {
            propositions: [{ id: "abc" }, { id: "def" }, { id: "ghi" }]
          }
        }
      }
    });

    const event = {
      getContent
    };

    eventRegistry.rememberEvent(event);

    expect(eventRegistry.toJSON()).toEqual({
      abc: {
        event: { id: "abc", type: "display" },
        timestamp: jasmine.any(Number),
        count: 1
      },
      def: {
        event: { id: "def", type: "display" },
        timestamp: jasmine.any(Number),
        count: 1
      },
      ghi: {
        event: { id: "ghi", type: "display" },
        timestamp: jasmine.any(Number),
        count: 1
      }
    });
  });

  it("does not register invalid events", () => {
    const eventRegistry = createEventRegistry();

    eventRegistry.rememberEvent({
      getContent: () => ({
        xdm: {
          eventType: "display"
        }
      })
    });
    eventRegistry.rememberEvent({
      getContent: () => ({
        xdm: {
          eventType: "display",
          _experience: {}
        }
      })
    });
    eventRegistry.rememberEvent({
      getContent: () => ({
        xdm: {
          eventType: "display",
          _experience: {
            decisioning: {}
          }
        }
      })
    });
    eventRegistry.rememberEvent({
      getContent: () => ({})
    });

    expect(eventRegistry.toJSON()).toEqual({});
  });

  it("increments count and sets timestamp", done => {
    const eventRegistry = createEventRegistry();

    const getContent = () => ({
      xdm: {
        eventType: "display",
        _experience: {
          decisioning: {
            propositions: [{ id: "abc" }]
          }
        }
      }
    });

    const event = {
      getContent
    };
    let lastEventTime = 0;
    eventRegistry.rememberEvent(event);

    expect(eventRegistry.getEvent("abc")).toEqual({
      event: { id: "abc", type: "display" },
      timestamp: jasmine.any(Number),
      count: 1
    });
    expect(eventRegistry.getEvent("abc").timestamp).toBeGreaterThan(
      lastEventTime
    );
    lastEventTime = eventRegistry.getEvent("abc").timestamp;

    setTimeout(() => {
      eventRegistry.rememberEvent(event); // again

      expect(eventRegistry.getEvent("abc")).toEqual({
        event: { id: "abc", type: "display" },
        timestamp: jasmine.any(Number),
        count: 2
      });
      expect(eventRegistry.getEvent("abc").timestamp).toBeGreaterThan(
        lastEventTime
      );
      done();
    }, 10);
  });
});
