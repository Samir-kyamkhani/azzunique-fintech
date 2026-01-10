import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import tenantReducer from "./tenantSlice";
import memberReducer from "./memberSlice";
import serverDetailReducer from "./serverDetailSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tenant: tenantReducer,
    member: memberReducer,
    serverDetail: serverDetailReducer,
  },
});
