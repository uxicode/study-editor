#!/usr/bin/env node
/**
 * .env 설정 스크립트
 * - JWT_SECRET 자동 생성
 * - .env.example 기반 .env 생성 (없을 때)
 */

import { randomBytes } from 'crypto'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env')
const examplePath = join(__dirname, '..', '.env.example')

const PLACEHOLDER_SECRET = 'your-jwt-secret-key-change-in-production'

function generateJwtSecret() {
  return randomBytes(64).toString('hex')
}

function main() {
  const jwtSecret = generateJwtSecret()

  if (!existsSync(envPath)) {
    const content = readFileSync(examplePath, 'utf-8')
    const updated = content.replace(
      `JWT_SECRET="${PLACEHOLDER_SECRET}"`,
      `JWT_SECRET="${jwtSecret}"`
    )
    writeFileSync(envPath, updated)
    console.log('✅ .env 생성 완료 (JWT_SECRET 자동 생성됨)')
  } else {
    const content = readFileSync(envPath, 'utf-8')
    if (content.includes(PLACEHOLDER_SECRET)) {
      const updated = content.replace(
        `JWT_SECRET="${PLACEHOLDER_SECRET}"`,
        `JWT_SECRET="${jwtSecret}"`
      )
      writeFileSync(envPath, updated)
      console.log('✅ .env 업데이트 완료 (JWT_SECRET 자동 생성됨)')
    } else {
      console.log('ℹ️ .env에 이미 JWT_SECRET이 설정되어 있습니다.')
    }
  }
}

main()
