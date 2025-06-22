
import axios from "axios";
import { auth } from "./firebase";

const tenant = window.location.hostname.split(".")[0];

const baseURL = `https://mint-tenant-core-back-end.onrender.com/api`;

const api = axios.create({
    baseURL,
    withCredentials: true,
});

console.log("🛰️ Axios baseURL:", baseURL);

api.interceptors.request.use(async (config) => {
    config.headers["x-tenant-id"] = tenant;

    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            auth.signOut().catch(() => {});
            setTimeout(() => {
                window.location.href = "/login";
            }, 100);
        }
        return Promise.reject(error);
    }
);

export default api;
export const tenantApi = (path) => `${tenant}${path}`;
