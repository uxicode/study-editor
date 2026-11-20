import type { FlowSpec } from '@/types/flow'
import { BACKEND_FLOWS } from './backend'
import { FRONTEND_FLOWS } from './frontend'
import { INTERVIEW_FLOWS } from './interview'

/**
 * 스텝 id → "흐름으로 보기" 다이어그램.
 * 등록된 스텝만 콘텐츠 패널의 이론 위에 다이어그램을 표시한다.
 */
export const FLOW_SPECS: Record<string, FlowSpec> = {
  ...BACKEND_FLOWS,
  ...FRONTEND_FLOWS,
  ...INTERVIEW_FLOWS
}

export function getFlowSpec(stepId: string): FlowSpec | null {
  return FLOW_SPECS[stepId] ?? null
}
