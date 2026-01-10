import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import tenantReducer from "./tenantSlice";
import memberReducer from "./memberSlice";
import serverDetailReducer from "./serverDetailSlice";
import tenantDomainReducer from "./tenantDomainSlice";
import smtpConfigReducer from "./smtpConfigSlice";
import tenantWebsiteReducer from "./tenantWebsiteSlice";
import tenantSocialMediaReducer from "./tenantSocialMediaSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tenant: tenantReducer,
    member: memberReducer,
    serverDetail: serverDetailReducer,
    tenantDomain: tenantDomainReducer,
    smtpConfig: smtpConfigReducer,
    tenantWebsite: tenantWebsiteReducer,
    tenantSocialMedia: tenantSocialMediaReducer,
  },
});
