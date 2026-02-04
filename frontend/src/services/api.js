import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7191/api", // .NET backend API
});

export default api;
