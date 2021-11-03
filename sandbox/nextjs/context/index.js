import { useReducer, createContext } from "react";
import { user } from "../reducers/user";

// create context
const Context = createContext({});
const initialState = {
  user: {
    name: null,
    avatar: null,
    id: null
  }
};

// context provider
const Provider = ({ children }) => {
  const [state, dispatch] = useReducer(user, initialState);
  const value = { state, dispatch };

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export { Context, Provider };
