/**
 * Prisma 관련 Express API 호출 서비스
 * - Prisma 스키마 → SQL 변환
 * - Prisma 출력 → INSERT SQL 변환
 * - api-service 기반 연동
 */

import { apiService } from '@/services/api-service'

interface ApiSuccessShape {
  success: boolean
  error?: string
}

export interface PrismaToSqlResponse {
  success: boolean
  error?: string
  sql: string
  tables: string[]
  modelsCount?: number
  enumsCount?: number
}

export interface PrismaOutputToSqlResponse {
  success: boolean
  error?: string
  insertStatements: string[]
}

async function postPrismaApi<T extends ApiSuccessShape>(
  path: string,
  body: Record<string, unknown>,
  errorMessage: string
): Promise<T> {
  const data = await apiService.post<T>(path, body)

  if (!data.success) {
    throw new Error(data.error || errorMessage)
  }

  return data
}

/**
 * Prisma 스키마 내용을 SQL로 변환 (POST /api/prisma-to-sql)
 */
export async function prismaToSql(schemaContent: string): Promise<string> {
  const result = await postPrismaApi<PrismaToSqlResponse>(
    '/api/prisma-to-sql',
    { schemaContent },
    'SQL 변환 실패'
  )
  return result.sql ?? ''
}

/**
 * Prisma 실행 출력을 INSERT SQL로 변환 (POST /api/prisma-output-to-sql)
 */
export async function prismaOutputToSql(
  output: string,
  schemaContent: string
): Promise<PrismaOutputToSqlResponse> {
  return postPrismaApi<PrismaOutputToSqlResponse>(
    '/api/prisma-output-to-sql',
    { output, schemaContent },
    'INSERT SQL 변환 실패'
  )
}
