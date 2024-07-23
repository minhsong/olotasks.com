import axios from "axios";

const baseUrl = process.env.REACT_APP_API_URL + "/notifications";

export const getNotifications = async () => {
  try {
    const res = await axios.get(baseUrl);
    return res.data;
  } catch (error) {
    throw error;
  }
};
