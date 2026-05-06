import { Router, type Request, type Response } from 'express'
import { prisma } from '../lib/prisma'
import { jwtAuth } from '../middleware/jwt'
import { internalError, ok } from '../utils/response'

const router = Router()

interface UserProgressBody {
  completedSteps?: string[]
  currentStep?: string
  attempts?: Record<string, number>
}

/**
 * GET /api/progress
 * JWT 필요 - 현재 사용자 진행상황 조회
 */
router.get('/', jwtAuth, async (req: Request, res: Response) => {
  try {
    const { userId } = req.authUser!

    const progress = await prisma.userProgress.findUnique({
      where: { userId }
    })

    if (!progress) {
      return ok(res, {
        progress: {
          completedSteps: [],
          currentStep: 'step-1',
          attempts: {}
        }
      })
    }

    const attempts = (progress.attempts as Record<string, number>) || {}
    return ok(res, {
      progress: {
        completedSteps: progress.completedSteps,
        currentStep: progress.currentStep,
        attempts
      }
    })
  } catch (error) {
    console.error('진행상황 조회 실패:', error)
    return internalError(res, error)
  }
})

/**
 * PUT /api/progress
 * JWT 필요 - 현재 사용자 진행상황 저장
 * Body: { completedSteps?: string[], currentStep?: string, attempts?: Record<string, number> }
 */
router.put('/', jwtAuth, async (req: Request, res: Response) => {
  try {
    const { userId } = req.authUser!
    const body = req.body as UserProgressBody

    const data = {
      completedSteps: body.completedSteps ?? [],
      currentStep: body.currentStep ?? 'step-1',
      attempts: (body.attempts ?? {}) as object
    }

    const progress = await prisma.userProgress.upsert({
      where: { userId },
      create: {
        userId,
        ...data
      },
      update: data
    })

    const attempts = (progress.attempts as Record<string, number>) || {}
    return ok(res, {
      progress: {
        completedSteps: progress.completedSteps,
        currentStep: progress.currentStep,
        attempts
      }
    })
  } catch (error) {
    console.error('진행상황 저장 실패:', error)
    return internalError(res, error)
  }
})

export default router
