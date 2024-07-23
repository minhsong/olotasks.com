import { configureStore } from "@reduxjs/toolkit";
import { createLogger } from "redux-logger";
import userReducer from "./Slices/userSlice";
import alertReducer from "./Slices/alertSlice";
import boardsReducer from "./Slices/boardsSlice";
import boardReducer from "./Slices/boardSlice";
import listReducer from "./Slices/listSlice";
import cardReducer from "./Slices/cardSlice";
import notificationReducer from "./Slices/notificationSlice";
const reducer = {
  user: userReducer,
  alert: alertReducer,
  boards: boardsReducer,
  board: boardReducer,
  list: listReducer,
  card: cardReducer,
  notification: notificationReducer,
};
const Store =
  process.env.NODE_ENV == "development"
    ? configureStore({
        reducer: reducer,
        devTools: true,
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware().concat(createLogger()),
        // Other middleware or configuration options can be added here
      })
    : configureStore({
        reducer: reducer,
      });
export default Store;
