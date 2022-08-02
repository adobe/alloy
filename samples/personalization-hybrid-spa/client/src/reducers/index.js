/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
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
