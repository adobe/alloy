import { PERSONALIZATION_DECISIONS_HANDLE } from "../Personalization/constants/handle";
import flattenObject from "../../utils/flattenObject";

export default ({
  decisionProvider,
  applyResponse,
  event,
  decisionContext
}) => {
  const context = {
    ...flattenObject(event.getContent()),
    ...decisionContext
  };

  const viewName = event.getViewName();

  return ({ response }) => {
    decisionProvider.addPayloads(
      response.getPayloadsByType(PERSONALIZATION_DECISIONS_HANDLE)
    );
    const propositions = decisionProvider.evaluate(context);
    applyResponse({ viewName, propositions });
  };
};
