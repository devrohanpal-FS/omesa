import axios from "axios";

const api = axios.create({
  baseURL: "",
  withCredentials: true, // Send cookie tokens
});

// Configure Axios to automatically fetch and submit CSRF tokens
api.defaults.xsrfCookieName = "csrfToken";
api.defaults.xsrfHeaderName = "X-CSRF-Token";

// Hook to check / initialize CSRF cookie
export const initCsrf = async () => {
  try {
    await api.get("/api/csrf-token");
  } catch (err) {
    console.error("Failed to initialize CSRF token:", err);
  }
};

export default api;
