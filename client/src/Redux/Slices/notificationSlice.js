import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  unreadCount: 0,
  notifications: [],
  isLoading: true,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    loadNotifications: (state, action) => {
      state.notifications = action.payload.notifications;
      state.unreadCount = action.payload.unreadCount;
    },
    setNotifications: (state, action) => {
      state.notifications = action.payload;
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  loadNotifications,
  setNotifications,
  setUnreadCount,
  setLoading,
} = notificationSlice.actions;

export default notificationSlice.reducer;
