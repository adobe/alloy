import { DEFAULT_CONTENT_ITEM, DOM_ACTION, HTML_CONTENT_ITEM } from "../constants/schema";
import PAGE_WIDE_SCOPE from "../../../constants/pageWideScope";
import { VIEW_SCOPE_TYPE } from "../constants/scopeType"

export default ({ next, isPageWideSurface, modules, storeClickMetrics }) => args => {
  const { proposition, viewName } = args;
  const {
    scope,
    scopeDetails: {
      characteristics: {
        scopeType
      } = {}
    } = {},
    items = []
  } = proposition.getHandle();

  /*if (scope === PAGE_WIDE_SCOPE || isPageWideSurface(scope) ||
    scopeType === VIEW_SCOPE_TYPE && scope === viewName) {
      */

    items.forEach((item, index) => {
      const {schema, data } = item;
      if (schema === DEFAULT_CONTENT_ITEM) {
        proposition.includeInDisplayNotification();
        proposition.addRenderer(index, () => undefined);
      }
      const { type, selector } = data || {};
      if (schema === DOM_ACTION && type && selector) {
        if (type === "click") {
          // Do not record the click proposition in display notification.
          // Store it for later.
          proposition.addRenderer(index, () => {
            storeClickMetrics({ selector, meta: proposition.getMeta() });
          });
        } else if (modules[type]) {
          proposition.includeInDisplayNotification();
          proposition.addRenderer(index, () => {
            return modules[type](data);
          });
        }
      }
      if (schema === HTML_CONTENT_ITEM && type && selector && modules[type]) {
        proposition.includeInDisplayNotification();
        proposition.addRenderer(index, () => {
          return modules[type](data);
        });
      }
    });
  //}
  // this proposition may contain items that need to be rendered or cached by other handlers.
  next(args);
};
