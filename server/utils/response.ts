import type { Response } from 'express'

const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const

export type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS]

interface ErrorPayload {
  success: false
  error: string
  stack?: string
}

function sendError(res: Response, status: HttpStatus, error: string, stack?: string): Response {
  const payload: ErrorPayload = { success: false, error }
  if (stack) payload.stack = stack
  return res.status(status).json(payload)
}

/** 400 Bad Request - 잘못된 요청/파라미터 */
export function badRequest(res: Response, error: string): Response {
  return sendError(res, HTTP_STATUS.BAD_REQUEST, error)
}

/** 401 Unauthorized - 인증 필요/실패 */
export function unauthorized(res: Response, error: string): Response {
  return sendError(res, HTTP_STATUS.UNAUTHORIZED, error)
}

/** 404 Not Found - 리소스 없음 */
export function notFound(res: Response, error: string): Response {
  return sendError(res, HTTP_STATUS.NOT_FOUND, error)
}

/** 409 Conflict - 중복/충돌 */
export function conflict(res: Response, error: string): Response {
  return sendError(res, HTTP_STATUS.CONFLICT, error)
}

/** 500 Internal Server Error - 서버 오류 */
export function internalError(res: Response, error: unknown): Response {
  const message = error instanceof Error ? error.message : String(error)
  const stack = process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
  return sendError(res, HTTP_STATUS.INTERNAL_ERROR, message, stack)
}

/** 503 Service Unavailable - 서비스 미설정 */
export function serviceUnavailable(res: Response, error: string): Response {
  return sendError(res, HTTP_STATUS.SERVICE_UNAVAILABLE, error)
}

/** 200 OK - 성공 응답 */
export function ok<T extends Record<string, unknown>>(res: Response, data: T): Response {
  return res.json({ success: true, ...data })
}
