import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  filter: {
    dateRange: {
      startDate: new Date(),
      endDate: new Date(),
    },
    labels: [],
    members: [],
    columns: [],
  },
};

const reportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {
    setFilter(state, action) {
      state.filter = action.payload;
    },
    setLoadingListService(state, action) {
      state.loadingListService = action.payload;
    },
  },
});

export const { setFilter, setLoadingListService } = reportSlice.actions;

export default reportSlice.reducer;
