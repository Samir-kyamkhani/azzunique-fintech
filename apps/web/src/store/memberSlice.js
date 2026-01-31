import { createSlice } from "@reduxjs/toolkit";

const memberSlice = createSlice({
  name: "member",
  initialState: {
    currentMember: null,
    membersList: [],
  },
  reducers: {
    setMember(state, action) {
      state.currentMember = action.payload;
    },
    clearMember(state) {
      state.currentMember = null;
    },
    setMembers(state, action) {
      state.membersList = action.payload;
    },
    clearMembers(state) {
      state.membersList = [];
    },
  },
});

export const { setMember, clearMember, setMembers, clearMembers } =
  memberSlice.actions;

export default memberSlice.reducer;
