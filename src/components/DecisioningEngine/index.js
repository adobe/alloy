import { noop } from "../../utils";
import createOnResponseHandler from "./createOnResponseHandler";
import createDecisionProvider from "./createDecisionProvider";
import createApplyResponse from "./createApplyResponse";
import createEventRegistry from "./createEventRegistry";

const createDecisioningEngine = () => {
  const eventRegistry = createEventRegistry();
  let applyResponse = createApplyResponse();
  const decisionProvider = createDecisionProvider();

  return {
    lifecycle: {
      onComponentsRegistered(tools) {
        applyResponse = createApplyResponse(tools.lifecycle);
      },
      onBeforeEvent({
        event,
        renderDecisions,
        decisionContext = {},
        onResponse = noop
      }) {
        if (renderDecisions) {
          onResponse(
            createOnResponseHandler({
              decisionProvider,
              applyResponse,
              event,
              decisionContext
            })
          );
          return;
        }

        eventRegistry.rememberEvent(event);
      }
    },
    commands: {
      renderDecisions: {
        run: decisionContext =>
          applyResponse({
            propositions: decisionProvider.evaluate(decisionContext)
          })
      }
    }
  };
};

createDecisioningEngine.namespace = "DecisioningEngine";
export default createDecisioningEngine;
