import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';

// On Android Emulator, 10.0.2.2 maps to the developer machine's localhost
const DEFAULT_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
const DEFAULT_API_BASE = `${DEFAULT_HOST}/api/v1`;

export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_BASE,
  timeout: 5000, // 5s timeout to quickly cascade to live news feeds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Client-Platform': Platform.OS,
  },
});

// Request Interceptor: Attach timestamp for latency monitoring
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    (config as any).metadata = { startTime: Date.now() };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Edge Cache & Performance Auditing
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const startTime = (response.config as any).metadata?.startTime;
    if (startTime) {
      const durationMs = Date.now() - startTime;
      const cacheHeader = response.headers['x-cache-hit'] || 'MISS';
      if (__DEV__) {
        console.log(`[API Latency] ${response.config.url} took ${durationMs}ms (Edge Cache: ${cacheHeader})`);
      }
    }
    return response;
  },
  (error) => {
    // Log info rather than console.warn to avoid intrusive YellowBox popup when backend is starting or offline
    if (__DEV__) {
      console.log(`[API Fallback Info] ${error.config?.url} unreachable, cascading to live news fallback.`);
    }
    return Promise.reject(error);
  }
);
