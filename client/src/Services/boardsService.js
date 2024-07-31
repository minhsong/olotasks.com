import axios from "axios";
import { openAlert } from "../Redux/Slices/alertSlice";
import {
  failFetchingBoards,
  startFetchingBoards,
  successFetchingBoards,
  successCreatingBoard,
  failCreatingBoard,
  startCreatingBoard,
} from "../Redux/Slices/boardsSlice";
import { addNewBoard } from "../Redux/Slices/userSlice";
import {
  setLoading,
  successFetchingBoard,
  updateTitle,
} from "../Redux/Slices/boardSlice";
const baseUrl = process.env.REACT_APP_API_URL + "/board";

export const getBoards = async (fromDropDown, dispatch) => {
  if (!fromDropDown) dispatch(startFetchingBoards());
  try {
    const res = await axios.get(baseUrl + "/");
    setTimeout(() => {
      dispatch(successFetchingBoards({ boards: res.data }));
    }, 1000);
  } catch (error) {
    dispatch(failFetchingBoards());
    dispatch(
      openAlert({
        message: error?.response?.data?.errMessage
          ? error.response.data.errMessage
          : error.message,
        severity: "error",
      })
    );
  }
};

export const createBoard = async (props, dispatch) => {
  return axios.post(baseUrl + "/create", props);
};

export const getBoard = async (boardId, dispatch) => {
  dispatch(setLoading(true));
  try {
    const res = await axios.get(baseUrl + "/" + boardId);
    dispatch(successFetchingBoard(res.data));
    setTimeout(() => {
      dispatch(setLoading(false));
    }, 1000);
  } catch (error) {
    dispatch(setLoading(false));
    dispatch(
      openAlert({
        message: error?.response?.data?.errMessage
          ? error.response.data.errMessage
          : error.message,
        severity: "error",
      })
    );
  }
};

export const boardTitleUpdate = async (title, boardId, dispatch) => {
  try {
    dispatch(updateTitle(title));
    await axios.put(baseUrl + "/" + boardId + "/update-board-title", {
      title: title,
    });
  } catch (error) {
    dispatch(
      openAlert({
        message: error?.response?.data?.errMessage
          ? error.response.data.errMessage
          : error.message,
        severity: "error",
      })
    );
  }
};
