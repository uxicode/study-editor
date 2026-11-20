import type { StaticCheck } from '@/types/curriculum'

/**
 * 면접 대응(week-10 ~ week-12) 스텝의 서술형 답변 채점 헬퍼.
 *
 * 마크다운 답변은 내용의 질을 기계가 판단할 수 없으므로 "구조"만 확인한다.
 * - 필수 섹션(`## 제목`)이 있고 비어 있지 않은지
 * - 목록 항목이 필요한 개수만큼 있는지
 * - 섹션 안에 꼭 다뤄야 할 키워드가 있는지
 *
 * 템플릿은 `## 제목 <!-- 안내 -->` 처럼 안내를 제목 줄에 두므로, 안내만 남은 상태는 통과하지 않는다.
 */

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 제목 뒤에는 괄호 부연, 안내 주석, 구분 기호(— : -)만 허용한다.
 * `## 마일스톤` 검사가 `## 마일스톤 기준` 섹션에 걸리지 않게 하기 위함이다.
 */
function headingSource(heading: string): string {
  return String.raw`^##[ \t]*${escapeRegExp(heading)}(?:[ \t]*(?:\(|<!--|[—–:-])[^\n]*)?[ \t]*\n`
}

const BLANK_LINES = String.raw`(?:[ \t]*\n)*`
const NOT_HEADING_OR_GUIDE = String.raw`(?![ \t]*(?:#|<!--))`
const LIST_MARKER = String.raw`(?:[-*]|\d+\.)[ \t]+`

/** `## heading` 바로 아래 첫 문단이 minChars 글자 이상인지 */
export function mdSection(target: string, heading: string, message: string, minChars = 15): StaticCheck {
  return {
    type: 'regex',
    target,
    pattern: new RegExp(`${headingSource(heading)}${BLANK_LINES}${NOT_HEADING_OR_GUIDE}[^\\n]{${minChars},}`, 'm'),
    message
  }
}

interface MdListOptions {
  /** 각 항목에 물음표가 있어야 하는지 (질문 목록) */
  question?: boolean
  /** 각 항목이 `- [ ]` 체크박스여야 하는지 (작업 목록) */
  checkbox?: boolean
  /** 각 항목이 이 정규식 소스로 시작해야 하는지 (예: 리뷰 코멘트 태그) */
  itemPrefix?: string
}

/** `## heading` 바로 아래에 목록 항목이 count 개 이상 연속으로 있는지 */
export function mdList(
  target: string,
  heading: string,
  count: number,
  message: string,
  options: MdListOptions = {}
): StaticCheck {
  const marker = options.checkbox ? String.raw`[-*][ \t]+\[[ xX]\][ \t]+` : LIST_MARKER
  const prefix = options.itemPrefix ?? ''
  const body = options.question ? String.raw`[^\n]*\?[^\n]*` : String.raw`[^\n]*\S[^\n]*`
  const item = String.raw`[ \t]*${marker}${prefix}${body}(?:\n|$)${BLANK_LINES}`

  return {
    type: 'regex',
    target,
    pattern: new RegExp(`${headingSource(heading)}${BLANK_LINES}(?:${item}){${count},}`, 'm'),
    message
  }
}

/** `## heading` 섹션(다음 `##` 전까지) 안의 어느 한 줄이 keywordSource 정규식을 포함하는지 */
export function mdSectionIncludes(
  target: string,
  heading: string,
  keywordSource: string,
  message: string
): StaticCheck {
  return {
    type: 'regex',
    target,
    pattern: new RegExp(
      `${headingSource(heading)}(?:(?!##)[^\\n]*\\n)*?(?!##)[^\\n]*(?:${keywordSource})`,
      'mi'
    ),
    message
  }
}

/** 코드 파일의 `// 라벨: 내용` 설명 주석이 채워져 있는지 */
export function codeNote(target: string, label: string, message: string, minChars = 5): StaticCheck {
  return {
    type: 'regex',
    target,
    pattern: new RegExp(String.raw`\/\/[ \t]*${escapeRegExp(label)}[ \t]*:[ \t]*\S[^\n]{${minChars - 1},}`),
    message
  }
}
