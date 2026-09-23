import axios from "axios";
import toast from "react-hot-toast";

const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

export const API_ENDPOINTS = {
  VENDORS: {
    LIST: "/vendors",
    CREATE: "/vendors",
    BY_ID: (id) => `/vendors/${id}`,
    UPDATE: (id) => `/vendors/${id}`,
    RESTORE_VERSION: (id, historyId) => `/vendors/${id}/restore/${historyId}`,
  },
  DOCUMENTS: {
    UPLOAD_AND_EXTRACT: (vendorId) => `/documents/upload/${vendorId}`,
    CHECKLIST: (vendorId) => `/documents/checklist/${vendorId}`,
    SEND_MISSING_EMAIL: (vendorId) =>
      `/documents/send-missing-email/${vendorId}`,
  },
  VERIFICATION: {
    EXTERNAL_VERIFY: (vendorId) => `/verification/external/${vendorId}`,
    UPDATE_STATUS: (vendorId) => `/verification/status/${vendorId}`,
    CREATE_TASK: "/verification/tasks",
    UPDATE_TASK_STATUS: (taskId) => `/verification/tasks/${taskId}/status`,
  },
};

// Simple Axios Instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Simple Response Interceptor for Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again.";

    toast.error(message);
    return Promise.reject(error);
  },
);

export default apiClient;
