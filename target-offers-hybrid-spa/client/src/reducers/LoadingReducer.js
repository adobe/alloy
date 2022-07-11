/**
 * Products Reducer
 * @param  {Array} state
 * @param  {Object} action
 */
const LoadingReducer = (state = {isVisible: false}, action) => {

  switch (action.type) {
    case 'SHOW_LOADING':
      return Object.assign({}, state, {
        isVisible: true
      });
      break;
    case 'HIDE_LOADING':
      return Object.assign({}, state, {
        isVisible: false
      });
      break;
    default:
      return state
  }
};
export default LoadingReducer