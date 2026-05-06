import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'

const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const AUTH_TOKEN_KEY = 'auth_token'

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY)
  }
}

export class ApiService {
  private client: AxiosInstance

  private getBaseURL(): string {
    const url = DEFAULT_API_BASE_URL.trim().replace(/\/+$/, '')
    const swaggerPaths = ['/v3/api-docs', '/swagger-ui', '/swagger', '/api-docs']
    let normalized = url
    for (const path of swaggerPaths) {
      if (normalized.endsWith(path)) {
        normalized = normalized.slice(0, -path.length)
      }
    }
    return normalized || DEFAULT_API_BASE_URL
  }

  constructor() {
    const baseURL = this.getBaseURL()
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // 요청 인터셉터: JWT 토큰 추가
    this.client.interceptors.request.use(
      (config) => {
        const token = getAuthToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // 응답 인터셉터: 에러 처리
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            const status = error.response.status
            const statusText = error.response.statusText
            const url = error.config?.url || '알 수 없는 URL'
            
            const data = error.response.data as { error?: string; message?: string } | undefined
            const backendErrorMessage =
              (typeof data?.error === 'string' ? data.error : null) ||
              data?.message ||
              null
            
            // ✅ 백엔드 에러 메시지가 있으면 우선 사용
            if (backendErrorMessage) {
              throw new Error(backendErrorMessage)
            }
            
            // 404는 특별 처리
            if (status === 404) {
              throw new Error(
                `API 엔드포인트를 찾을 수 없습니다: ${url}\n` +
                `서버 URL이 올바른지 확인하세요. (예: http://localhost:3001)`
              )
            }
            
            // 기본 에러 메시지
            throw new Error(
              `API Error: ${status} - ${statusText}\n` +
              `요청 URL: ${error.config?.baseURL || ''}${url}`
            )
          } else if (error.request) {
            throw new Error(
              `API 서버에 연결할 수 없습니다.\n` +
              `서버가 실행 중인지 확인하세요. (Base URL: ${error.config?.baseURL || '설정되지 않음'})`
            )
          }
        }
        throw error
      }
    )
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }

  recreateClient() {
    const baseURL = this.getBaseURL()
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            const status = error.response.status
            const statusText = error.response.statusText
            const url = error.config?.url || '알 수 없는 URL'
            
            const data = error.response.data as { error?: string; message?: string } | undefined
            const backendErrorMessage =
              (typeof data?.error === 'string' ? data.error : null) ||
              data?.message ||
              null
            
            // ✅ 백엔드 에러 메시지가 있으면 우선 사용
            if (backendErrorMessage) {
              throw new Error(backendErrorMessage)
            }
            
            // 404는 특별 처리
            if (status === 404) {
              throw new Error(
                `API 엔드포인트를 찾을 수 없습니다: ${url}\n` +
                `서버 URL이 올바른지 확인하세요. (예: http://localhost:3001)`
              )
            }
            
            // 기본 에러 메시지
            throw new Error(
              `API Error: ${status} - ${statusText}\n` +
              `요청 URL: ${error.config?.baseURL || ''}${url}`
            )
          } else if (error.request) {
            throw new Error(
              `API 서버에 연결할 수 없습니다.\n` +
              `서버가 실행 중인지 확인하세요. (Base URL: ${error.config?.baseURL || '설정되지 않음'})`
            )
          }
        }
        throw error
      }
    )
  }
}

export const apiService = new ApiService()
