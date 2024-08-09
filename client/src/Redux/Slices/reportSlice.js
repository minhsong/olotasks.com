import { createSlice } from "@reduxjs/toolkit";
import dayjs from "dayjs";

const initialState = {
  filter: {
    dateRange: {
      startDate: dayjs(new Date()).startOf("date").toDate(),
      endDate: dayjs(new Date()).endOf("date").toDate(),
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
    resetFilter(state) {
      state.filter = {
        dateRange: {
          startDate: dayjs(new Date()).startOf("date").toDate(),
          endDate: dayjs(new Date()).endOf("date").toDate(),
        },
        labels: [],
        members: [],
        columns: [],
      };
    },
  },
});

export const { setFilter, setLoadingListService, resetFilter } =
  reportSlice.actions;

export default reportSlice.reducer;
