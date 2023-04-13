export default () => {
  const events = {};
  const rememberEvent = event => {
    const { xdm = {} } = event.getContent();
    const { eventType = "", _experience } = xdm;

    if (
      !eventType ||
      !_experience ||
      typeof _experience !== "object" ||
      eventType === ""
    ) {
      return;
    }

    const { decisioning = {} } = _experience;
    const { propositions = [] } = decisioning;

    propositions.forEach(proposition => {
      let count = 0;
      const existingEvent = events[proposition.id];
      if (existingEvent) {
        count = existingEvent.count;
      }

      events[proposition.id] = {
        event: { id: proposition.id, type: eventType },
        timestamp: new Date().getTime(),
        count: count + 1
      };
    });
  };

  const getEvent = eventId => events[eventId];

  return { rememberEvent, getEvent, toJSON: () => events };
};
