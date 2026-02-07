import { createSlice } from "@reduxjs/toolkit";

const tenantServiceSlice = createSlice({
  name: "tenantService",
  initialState: {
    tenantServices: [],
    selectedTenantId: null,
  },
  reducers: {
    setTenantServices(state, action) {
      state.tenantServices = action.payload;
    },
    setSelectedTenant(state, action) {
      state.selectedTenantId = action.payload;
    },
    clearTenantServices(state) {
      state.tenantServices = [];
      state.selectedTenantId = null;
    },
  },
});

export const { setTenantServices, setSelectedTenant, clearTenantServices } =
  tenantServiceSlice.actions;

export default tenantServiceSlice.reducer;
