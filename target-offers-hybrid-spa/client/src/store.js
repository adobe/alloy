import { applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";
import reducers from "./reducers/index";
import { Loading } from "./middlewares/Loading";
import { Auth } from "./middlewares/Auth";

//const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
/**
 * Create Middleware
 */
const middleware = applyMiddleware(thunk, Loading, Auth);
/**
 * Create Store
 */
const store = createStore(
  reducers,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
  middleware
);

export default store;
