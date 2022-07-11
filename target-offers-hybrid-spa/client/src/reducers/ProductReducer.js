/**
 * Product Reducer
 * @param  {Array} state
 * @param  {Object} action
 */
const ProductReducer = (state = {fetching: false, data: {}}, action) => {
  switch (action.type) {
    case 'REQUEST_PRODUCT':
      return Object.assign({}, state, {
        fetching: true,
        data: {}
      });
      break;
    case 'RECEIVE_PRODUCT':
      let filtered = action.payload.filter((product) => {
        return product.id == action.id
      });
      return Object.assign({}, state, {
        fetching: false,
        data: filtered[0]
      });
      break;
    case 'CLEAR_PRODUCT':
      return Object.assign({}, state, {
        fetching: false,
        data: {}
      });
      break;
    default:
      return state
  }
};
export default ProductReducer