import { REDIRECT_ITEM } from "../constants/schema";
import { find } from "../../../utils";

export default ({ next }) => args => {
  const { proposition } = args;
  const { items } = proposition.getHandle();

  const redirectItem = find(items, ({ schema }) => schema === REDIRECT_ITEM);
  if (redirectItem) {
    const { data: { content } } = redirectItem;
    proposition.redirect(content);
    // On a redirect, nothing else needs to handle this.
  } else {
    next(args);
  }
};
