import extractDecisions from "./extractDecisions";
import executeDecisions from "./executeDecisions";
import { showContainers } from "./flicker";
import { executeActions } from "./dom-actions";

export default ({ renderDecisions, response, modules, logger }) => {
  const [renderableDecisions, decisions] = extractDecisions(response);

  if (renderDecisions) {
    executeDecisions(renderableDecisions, modules, logger, executeActions);
    showContainers();
    return { decisions };
  }

  return { decisions: [...renderableDecisions, ...decisions] };
};
