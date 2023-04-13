import createEvaluableRulesetPayload from "./createEvaluableRulesetPayload";

export default () => {
  const payloads = {};

  const addPayload = payload => {
    if (!payload.id) {
      return;
    }

    const evaluableRulesetPayload = createEvaluableRulesetPayload(payload);

    if (evaluableRulesetPayload.isEvaluable) {
      payloads[payload.id] = evaluableRulesetPayload;
    }
  };

  const evaluate = (context = {}) =>
    Object.values(payloads)
      .map(payload => payload.evaluate(context))
      .filter(payload => payload.items.length > 0);

  const addPayloads = personalizationPayloads => {
    personalizationPayloads.forEach(addPayload);
  };

  return {
    addPayload,
    addPayloads,
    evaluate
  };
};
