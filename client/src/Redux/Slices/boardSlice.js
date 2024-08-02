import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: "",
  title: "",
  backgroundImageLink: "",
  isImage: true,
  lists: [],
  members: [],
  activity: [],
  loading: true,
  description: "",
  activityLoading: false,
  Search: {
    text: "",
    mentions: [],
  },
};

const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    successFetchingBoard: (state, action) => {
      state.id = action.payload._id;
      state.title = action.payload.title;
      state.backgroundImageLink = action.payload.backgroundImageLink;
      state.isImage = action.payload.isImage;
      state.lists = action.payload.lists;
      state.members = action.payload.members;
      state.activity = action.payload.activity;
      state.description = action.payload.description;
      state.labels = action.payload.labels;
      state.shortId = action.payload.shortId;
      state.Search = {
        text: "",
        mentions: [],
      };
    },
    updateTitle: (state, action) => {
      state.title = action.payload;
    },
    setActivityLoading: (state, action) => {
      state.activityLoading = action.payload;
    },
    updateActivity: (state, action) => {
      state.activity = action.payload;
    },
    updateDescription: (state, action) => {
      state.description = action.payload;
    },
    updateBackground: (state, action) => {
      const { background, isImage } = action.payload;
      state.backgroundImageLink = background;
      state.isImage = isImage;
    },
    addMembers: (state, action) => {
      state.members = action.payload;
    },
    updateBoardLabels: (state, action) => {
      const { labelId, text, color, backColor } = action.payload;
      state.labels = state.labels.map((label) => {
        if (label._id === labelId) {
          label.text = text;
          label.color = color;
          label.backColor = backColor;
        }
        return label;
      });
    },
    updateSearch: (state, action) => {
      state.Search = action.payload;
    },
    updateMembers: (state, action) => {
      state.members = action.payload;
    },
  },
});

export const {
  setLoading,
  successFetchingBoard,
  updateTitle,
  setActivityLoading,
  updateActivity,
  updateDescription,
  updateBackground,
  addMembers,
  updateBoardLabels,
  updateSearch,
  updateMembers,
} = boardSlice.actions;
export default boardSlice.reducer;
