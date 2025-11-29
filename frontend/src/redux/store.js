import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice.jsx";
import cartReducer from "./features/cartSlice.jsx";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
  },
});
