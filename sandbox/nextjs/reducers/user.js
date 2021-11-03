export const USER_LOG_IN = "USER_LOG_IN";
export const USER_LOG_OUT = "USER_LOG_OUT";

export function user(state, action) {
  const initialState = {
    user: {
      name: null,
      avatar: null,
      id: null
    }
  };

  switch (action.type) {
    case "USER_LOG_IN":
      return { ...state, user: action.payload };
    case "USER_LOG_OUT":
      return { ...state, user: initialState };
    default:
      return state;
  }
}
