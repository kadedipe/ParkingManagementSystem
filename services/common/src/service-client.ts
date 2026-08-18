// ============================================================================
// Service Client - Service-to-Service Communication
// ============================================================================

// parking-management-system/services/common/src/service-client.ts

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from 'dotenv';

config();

export interface ServiceClientConfig {
    baseURL: string;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
}

export class ServiceClient {
    private client: AxiosInstance;
    private retries: number;
    private retryDelay: number;

    constructor(config: ServiceClientConfig) {
        this.client = axios.create({
            baseURL: config.baseURL,
            timeout: config.timeout || 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.retries = config.retries || 3;
        this.retryDelay = config.retryDelay || 1000;

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // Request interceptor
        this.client.interceptors.request.use(
            (config) => {
                // Add request ID for tracing
                config.headers['X-Request-ID'] = this.generateRequestId();
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor
        this.client.interceptors.response.use(
            (response) => response,
            async (error) => {
                const { config } = error;
                if (!config || !config.retry) {
                    return Promise.reject(error);
                }

                config.__retryCount = config.__retryCount || 0;

                if (config.__retryCount >= this.retries) {
                    return Promise.reject(error);
                }

                config.__retryCount += 1;

                // Wait before retrying
                await new Promise((resolve) => setTimeout(resolve, this.retryDelay));

                // Retry the request
                return this.client(config);
            }
        );
    }

    private generateRequestId(): string {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    }

    async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.get<T>(url, config);
        return response.data;
    }

    async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.post<T>(url, data, config);
        return response.data;
    }

    async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.put<T>(url, data, config);
        return response.data;
    }

    async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.patch<T>(url, data, config);
        return response.data;
    }

    async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.delete<T>(url, config);
        return response.data;
    }

    async upload<T = any>(url: string, file: File, config?: AxiosRequestConfig): Promise<T> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await this.client.post<T>(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            ...config,
        });

        return response.data;
    }
}

// ============================================================================
// Service Registry - Service Discovery
// ============================================================================

export class ServiceRegistry {
    private services: Map<string, ServiceClient> = new Map();

    registerService(name: string, config: ServiceClientConfig): void {
        this.services.set(name, new ServiceClient(config));
    }

    getService(name: string): ServiceClient {
        const service = this.services.get(name);
        if (!service) {
            throw new Error(`Service ${name} not found in registry`);
        }
        return service;
    }

    hasService(name: string): boolean {
        return this.services.has(name);
    }

    getAllServices(): Map<string, ServiceClient> {
        return this.services;
    }
}

// ============================================================================
// Error Handling
// ============================================================================

export class ServiceError extends Error {
    constructor(
        public status: number,
        public message: string,
        public code?: string,
        public details?: any
    ) {
        super(message);
        this.name = 'ServiceError';
    }
}

export const handleServiceError = (error: any): ServiceError => {
    if (error.response) {
        // The request was made and the server responded with a status code
        return new ServiceError(
            error.response.status,
            error.response.data?.message || 'Service error',
            error.response.data?.code,
            error.response.data?.details
        );
    } else if (error.request) {
        // The request was made but no response was received
        return new ServiceError(503, 'Service unavailable', 'SERVICE_UNAVAILABLE');
    } else {
        // Something happened in setting up the request that triggered an Error
        return new ServiceError(500, error.message, 'INTERNAL_ERROR');
    }
};