import { createSlice, createSelector } from "@reduxjs/toolkit";

const memberSlice = createSlice({
  name: "member",
  initialState: {
    list: [],
    total: 0,

    stats: {
      ACTIVE: 0,
      INACTIVE: 0,
      SUSPENDED: 0,
      DELETED: 0,
    },

    page: 1,
    perPage: 10,
    search: "",
    statusFilter: "all",

    isCreateOpen: false,
    isEditOpen: false,
  },

  reducers: {
    setMembers(state, action) {
      const { data, total, stats } = action.payload;
      state.list = data;
      state.total = total;
      state.stats = stats;
    },

    addMember(state, action) {
      state.list.unshift(action.payload);
      state.total += 1;
    },

    updateMember(state, action) {
      const idx = state.list.findIndex((m) => m.id === action.payload.id);
      if (idx !== -1) state.list[idx] = action.payload;
    },

    setSelected(state, action) {
      state.selected = action.payload;
    },

    setPage(state, action) {
      state.page = action.payload;
    },

    setPerPage(state, action) {
      state.perPage = action.payload;
      state.page = 1;
    },

    setSearch(state, action) {
      state.search = action.payload;
      state.page = 1;
    },

    setStatusFilter(state, action) {
      state.statusFilter = action.payload;
      state.page = 1;
    },

    openCreate(state) {
      state.isCreateOpen = true;
    },
    closeCreate(state) {
      state.isCreateOpen = false;
    },

    openEdit(state, action) {
      state.selected = action.payload;
      state.isEditOpen = true;
    },
    closeEdit(state) {
      state.selected = null;
      state.isEditOpen = false;
    },
  },
});

export default memberSlice.reducer;

export const {
  setMembers,
  addMember,
  updateMember,
  setSelected,
  setPage,
  setPerPage,
  setSearch,
  setStatusFilter,
  openCreate,
  closeCreate,
  openEdit,
  closeEdit,
} = memberSlice.actions;

export const selectMemberState = (state) => state.member;

export const selectMembers = createSelector(
  [selectMemberState],
  (state) => state.list
);

export const selectPagination = createSelector(
  [selectMemberState],
  ({ page, perPage, total }) => ({ page, perPage, total })
);

export const selectMemberQuery = createSelector(
  [selectMemberState],
  ({ page, perPage, search, statusFilter }) => ({
    page,
    limit: perPage,
    search,
    status: statusFilter !== "all" ? statusFilter : undefined,
  })
);
