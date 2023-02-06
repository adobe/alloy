import { DOM_ACTION } from "../constants/schema";

export default ({ next }) => args => {
  const { proposition, viewName } = args;
  const {
    scope,
    scopeDetails: {
      characteristics: {
        scopeType
      }
    },
    items
  } = proposition.getHandle();

  if (scope === PAGE_WIDE_SCOPE || isPageWideSurface(scope) ||
    scopeType === VIEW_SCOPE_TYPE && scope === viewName) {

    if (items.some(({ schema }) => schema === DOM_ACTION )) {
      //render(createItemRenderer(items));
      /*
  const { schema, data } = item;
  if (schema === DOM_ACTION) {
    const execute = modules[type]
    const remappedData = remapHeadOffers(data);
    render(() => {
      if (!execute) {
        logger.error(`DOM action "${type}" not found`);
        return;
      }
      return execute();
    });
  }
*/
    }
  }
  // this proposition may contain items that need to be rendered or cached by other handlers.
  next(args);
};
