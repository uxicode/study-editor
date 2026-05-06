import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const ADMIN_EMAIL = 'jbc2119@naver.com'
const ADMIN_PASSWORD = '1234'

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL }
  })

  if (existing) {
    console.log('ℹ️ 관리자 계정이 이미 존재합니다:', ADMIN_EMAIL)
    return
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10)
  await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      password: passwordHash,
      provider: 'email'
    }
  })

  console.log('✅ 관리자 계정 생성 완료:', ADMIN_EMAIL)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
