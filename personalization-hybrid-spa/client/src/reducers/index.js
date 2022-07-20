import { combineReducers } from 'redux'
import AboutReducer from './AboutReducer'
import ProductsReducer from './ProductsReducer'
import LatestProductsReducer from './LatestProductsReducer'
import ProductReducer from './ProductReducer'
import LoadingReducer from './LoadingReducer'
import CartReducer from './CartReducer'
import WishlistReducer from './WishlistReducer'
import { routerReducer } from 'react-router-redux'

/**
 * Combine Reducers In One Object
 */
export default combineReducers({
  AboutReducer,
  ProductsReducer,
  LatestProductsReducer,
  ProductReducer,
  LoadingReducer,
  CartReducer,
  WishlistReducer,
  routing: routerReducer
})
