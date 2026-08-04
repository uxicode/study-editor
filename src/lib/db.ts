import Dexie, { type EntityTable } from 'dexie'

export interface UserEntity {
  id: string
  email: string
  passwordHash: string
  createdAt: string
}

export interface SessionEntity {
  id: string
  userId: string
  email: string
  createdAt: string
}

export interface UserProgressEntity {
  userId: string
  completedSteps: string[]
  currentStep: string
  currentSteps: Record<string, string>
  activeCurriculum: string
  attempts: Record<string, number>
  updatedAt: string
}

class StudyEditorDB extends Dexie {
  users!: EntityTable<UserEntity, 'id'>
  sessions!: EntityTable<SessionEntity, 'id'>
  userProgress!: EntityTable<UserProgressEntity, 'userId'>

  constructor() {
    super('StudyEditorDB')
    this.version(1).stores({
      users: 'id, &email',
      sessions: 'id, userId',
      userProgress: 'userId'
    })
  }
}

export const db = new StudyEditorDB()
