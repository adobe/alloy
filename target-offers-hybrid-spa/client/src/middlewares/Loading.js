export const Loading = store => next => action => {

  let prev = next(action);

  let isFetching = null;

  Object.keys(store.getState()).map((reducer) => {
    if ('fetching' in store.getState()[reducer]) {
      isFetching = isFetching || store.getState()[reducer]['fetching']
    }
  });

  if (isFetching) {
    next({type: "SHOW_LOADING"})
  } else {
    next({type: "HIDE_LOADING"})
  }

  return prev
};
