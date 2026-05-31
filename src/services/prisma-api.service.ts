/**
 * Prisma 시뮬레이션 서비스
 * - Prisma 스키마 → MySQL DDL
 * - Prisma 실행 출력 → INSERT SQL
 *
 * 모든 변환은 프론트엔드의 `src/lib/learning` 에서 수행한다.
 */

import {
  prismaOutputToSql as runPrismaOutputToSql,
  prismaSchemaToSql
} from '@/lib/learning'

export interface PrismaOutputToSqlResponse {
  insertStatements: Array<{ sql: string; tableName: string }>
  objectsCount: number
}

export async function prismaToSql(schemaContent: string): Promise<string> {
  const result = prismaSchemaToSql(schemaContent)
  return result.sql
}

export async function prismaOutputToSql(
  output: string,
  schemaContent: string
): Promise<PrismaOutputToSqlResponse> {
  return runPrismaOutputToSql(output, schemaContent)
}
