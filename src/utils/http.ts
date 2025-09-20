import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../config/api';

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export interface HttpClientOptions {
    baseURL?: string;
    timeoutMs?: number;
    retries?: number;
    retryDelayMs?: number;
    getAuthToken?: () => Promise<string | null>;
}

export interface NormalizedHttpError extends Error {
    isNetworkError: boolean;
    status?: number;
    code?: string;
    url?: string;
    details?: any;
}

function toNormalizedError(err: unknown, url?: string): NormalizedHttpError {
    if (axios.isAxiosError(err)) {
        const ae = err as AxiosError<any>;
        const error: NormalizedHttpError = Object.assign(new Error(ae.message), {
            name: 'HttpError',
            isNetworkError: !!ae.code && ae.code.startsWith('ERR_'),
            status: ae.response?.status,
            code: ae.code,
            url,
            details: ae.response?.data ?? ae.toJSON?.()
        });
        return error;
    }
    const error: NormalizedHttpError = Object.assign(new Error((err as any)?.message || 'Unknown error'), {
        name: 'HttpError',
        isNetworkError: true,
        url
    });
    return error;
}

export class HttpClient {
    private axios: AxiosInstance;
    private retries: number;
    private retryDelayMs: number;
    private getAuthToken?: () => Promise<string | null>;

    constructor(options?: HttpClientOptions) {
        this.axios = axios.create({
            baseURL: (options?.baseURL || API_BASE_URL).replace(/\/$/, ''),
            timeout: options?.timeoutMs ?? 15000
        });
        this.retries = Math.max(0, options?.retries ?? 2);
        this.retryDelayMs = Math.max(0, options?.retryDelayMs ?? 500);
        this.getAuthToken = options?.getAuthToken;

        // Add auth header automatically
        this.axios.interceptors.request.use(async (config) => {
            try {
                const token = await this.getAuthToken?.();
                if (token) {
                    config.headers = config.headers || {};
                    (config.headers as any)['Authorization'] = `Bearer ${token}`;
                }
            } catch (_) { }
            return config;
        });
    }

    private async requestWithRetry<T>(method: HttpMethod, url: string, config?: AxiosRequestConfig): Promise<T> {
        let attempt = 0;
        let lastError: any;
        while (attempt <= this.retries) {
            try {
                const res = await this.axios.request<T>({ method, url, ...config });
                return res.data as any;
            } catch (err) {
                lastError = toNormalizedError(err, `${this.axios.defaults.baseURL}${url}`);
                const status = (err as any)?.response?.status;
                const retriable =
                    (typeof status === 'number' && status >= 500) || // server errors
                    (err as any)?.code === 'ECONNABORTED' || // timeout
                    (err as any)?.message?.includes('Network request failed');

                if (!retriable || attempt === this.retries) {
                    throw lastError;
                }
                await new Promise(r => setTimeout(r, this.retryDelayMs * Math.pow(2, attempt)));
                attempt++;
            }
        }
        throw lastError;
    }

    get<T>(url: string, config?: AxiosRequestConfig) {
        return this.requestWithRetry<T>('get', url, config);
    }
    post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
        return this.requestWithRetry<T>('post', url, { ...config, data });
    }
    patch<T>(url: string, data?: any, config?: AxiosRequestConfig) {
        return this.requestWithRetry<T>('patch', url, { ...config, data });
    }
    put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
        return this.requestWithRetry<T>('put', url, { ...config, data });
    }
    delete<T>(url: string, config?: AxiosRequestConfig) {
        return this.requestWithRetry<T>('delete', url, config);
    }
}

export const httpClient = new HttpClient({
    retries: 2,
    timeoutMs: 15000,
    retryDelayMs: 500,
});


