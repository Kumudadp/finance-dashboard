import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const client = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = "Bearer " + token;
  console.log("REQUEST:", config.method.toUpperCase(), config.url, config.data);
  return config;
});

client.interceptors.response.use(
  (res) => {
    console.log("RESPONSE:", res.status, res.config.url, res.data);
    return res;
  },
  (err) => {
    console.error(
      "ERROR:",
      err.response?.status,
      err.response?.config?.url,
      err.response?.data
    );

    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(err);
  }
);

export default client;
