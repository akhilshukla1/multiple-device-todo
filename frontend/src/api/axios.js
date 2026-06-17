import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    //this is what an originalRequest contains
    //     {
    //   method: "get",
    //   url: "/user/get-sessions",
    //   headers: {
    //     Authorization: "Bearer expiredToken"
    //   }
    // }
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await axios.post(
          "http://localhost:5000/user/refresh",
          {},
          { withCredentials: true },
        );
        const newAccessToken = response.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        // window.location.href = "/";
        // if (window.location.pathname !== "/") {
        //   window.location.href = "/";
        // }
        console.log("Refresh token failed");
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);
export default api;
