import { REDIRECT_ITEM } from "../constants/schema"

export default ({ next }) => args => {
  const { handle: { items }, redirect } = args;

  const redirectItem = find(items, ({ schema }) => schema === REDIRECT_ITEM);
  if (redirectItem) {
    const { data: { content } } = redirectItem;
    redirect(content);
    // On a redirect, nothing else needs to handle this.
  } else {
    next(args);
  }
};
