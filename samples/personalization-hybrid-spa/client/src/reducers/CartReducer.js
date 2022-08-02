/**
 * Cart Reducer
 * @param  {Object} state
 * @param  {Object} action
 */
const CartReducer = (state = {
  loading: false,
  data: {}
}, action) => {
  switch (action.type) {
    case 'REQUEST_ADD_TO_CART':
      return Object.assign({}, state, {loading: true});
      break;
    case 'RECEIVE_ADD_TO_CART':
      return Object.assign({}, state, {loading: false});
      break;
    case 'REQUEST_CART':
      return Object.assign({}, state, {loading: true});
      break;
    case 'RECEIVE_CART':
      return Object.assign({}, state, {
        loading: false,
        data: action.payload
      });
      break;
    case 'REQUEST_REMOVE_FROM_CART':
      return Object.assign({}, state, {
        loading: true
      });
      break;
    case 'RECEIVE_REMOVE_FROM_CART':
      return Object.assign({}, state, {
        loading: false
      });
      break;
    case 'REQUEST_DELETE_CART':
      return Object.assign({}, state, {
        loading: true
      });
      break;
    case 'RECEIVE_DELETE_CART':
      return Object.assign({}, state, {
        loading: false
      });
      break;
    default:
      return state
  }
};
export default CartReducer
