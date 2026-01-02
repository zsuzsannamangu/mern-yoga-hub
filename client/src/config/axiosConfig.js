/*The axiosConfig.js file sets up two Axios instances (userAxiosInstance and adminAxiosInstance) 
that are customized for making HTTP requests to the backend server. userAxiosInstance handles HTTP requests
related to users. While adminAxiosInstance handles HTTP requests related to admins. 
These instances handle tasks such as adding authentication tokens to requests, refreshing 
tokens when they expire, and logging errors or responses for debugging purposes.*/

import axios from 'axios'; // import Axios library for making HTTP requests

// ---------------------- USER AXIOS INSTANCE ----------------------

// Create an Axios instance for user-related requests
export const userAxiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API}/api/user`,    // Backend server URL
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Include cookies with requests (e.g., for session management)
});

// Add a request interceptor to include the user token in the Authorization header
userAxiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('userToken'); // Retrieve the user token from localStorage
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`; // Add the token to request headers
    }
    return config; // Return the modified request
});

let isRefreshing = false; // Prevent multiple simultaneous token refreshes

// Add a response interceptor to handle token expiration and refresh
userAxiosInstance.interceptors.response.use(
    (response) => response, // Pass successful responses directly
    async (error) => {
        // Check if the error is due to an expired token
        if (error.response && error.response.status === 401 && !isRefreshing) {
            // Don't try to refresh on validate-token or login endpoints
            const url = error.config?.url || '';
            if (url.includes('/validate-token') || url.includes('/login') || url.includes('/verify-login')) {
                return Promise.reject(error);
            }

            isRefreshing = true; // Set the refreshing flag
            try {
                // Request a new token from the refresh endpoint
                const refreshResponse = await userAxiosInstance.post('/refresh-token');
                const newAccessToken = refreshResponse.data.accessToken;

                if (newAccessToken) {
                    // Save the new token to localStorage
                    localStorage.setItem('userToken', newAccessToken);

                    // Retry the original request with the new token
                    error.config.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return userAxiosInstance.request(error.config);
                } else {
                    throw new Error('No access token received');
                }
            } catch (refreshError) {
                // Handle token refresh failure - redirect to login but don't clear everything immediately
                // Let the user see an error message first
                console.error('Token refresh failed:', refreshError);
                // Don't automatically redirect - let the component handle it
                return Promise.reject(error);
            } finally {
                isRefreshing = false; // Reset the refreshing flag
            }
        }
        return Promise.reject(error); // Pass other errors to be handled elsewhere
    }
);

// ---------------------- ADMIN AXIOS INSTANCE ----------------------

// Create an Axios instance for admin-related requests
export const adminAxiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API}`, // Backend server URL
    withCredentials: true, // Include cookies with requests
});

// Add a request interceptor to include the admin token in the Authorization header
adminAxiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminToken'); // Retrieve the admin token from localStorage
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`; // Add the token to request headers
    }
    return config; // Return the modified request
});

// Add a response interceptor to handle token expiration and refresh for admins
adminAxiosInstance.interceptors.response.use(
    (response) => response, // Pass successful responses directly
    async (error) => {
        // Check if the error is due to an expired token
        if (error.response && error.response.status === 401 && !isRefreshing) {
            isRefreshing = true; // Set the refreshing flag
            try {
                // Request a new token from the refresh endpoint
                const refreshResponse = await adminAxiosInstance.post('/api/admin/refresh-token');
                const newAccessToken = refreshResponse.data.accessToken;

                // Save the new token to localStorage
                localStorage.setItem('adminToken', newAccessToken);

                // Retry the original request with the new token
                error.config.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return adminAxiosInstance.request(error.config);
            } catch (refreshError) {
                // Handle token refresh failure (e.g., log out the admin)
                localStorage.removeItem('adminToken'); // Clear the token
                localStorage.removeItem('admin'); // Clear admin details
                window.location.href = '/admin'; // Redirect to the admin login page
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false; // Reset the refreshing flag
            }
        }
        return Promise.reject(error); // Pass other errors to be handled elsewhere
    }
);

// ---------------------- DEBUGGING INTERCEPTORS ----------------------

// Log requests and responses for debugging (User Axios)
userAxiosInstance.interceptors.request.use(
    (config) => {
        console.log('[User Request]', config);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

userAxiosInstance.interceptors.response.use(
    (response) => {
        console.log('[User Response]', response);
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Log requests and responses for debugging (Admin Axios)
adminAxiosInstance.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

adminAxiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);