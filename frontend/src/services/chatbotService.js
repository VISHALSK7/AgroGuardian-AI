import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

export const sendMessage = async (payload) => {
  const res = await API.post("/chat", payload);
  return res.data;
};
