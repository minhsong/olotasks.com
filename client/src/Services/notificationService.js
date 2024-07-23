import axios from "axios";
import {
  loadNotifications,
  setLoading,
  setUnreadCount,
} from "../Redux/Slices/notificationSlice";

const baseUrl = process.env.REACT_APP_API_URL + "/notification";

export const getNotifications = async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const res = await axios.get(baseUrl);
    dispatch(loadNotifications(res.data));
    dispatch(setLoading(false));
    return res.data;
  } catch (error) {
    dispatch(setLoading(false));
    throw error;
  }
};

export const markAsRead = async (id, dispatch) => {
  try {
    const res = await axios.put(baseUrl + "/" + id + "/mark-as-read");
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const markAllAsRead = async (dispatch) => {
  try {
    const res = await axios.put(baseUrl + "/mark-all-as-read");
    dispatch(setUnreadCount(0));
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const getUnreadCount = async (dispatch) => {
  try {
    const res = await axios.get(baseUrl + "/unread-count");
    return res.data;
  } catch (error) {
    throw error;
  }
};
