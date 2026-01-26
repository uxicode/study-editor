/**
 * Prisma 스키마 코드 병합 유틸리티
 */

/**
 * Prisma 스키마 부분 코드를 기존 파일에 병합
 */
export function mergePrismaPartialCode(
  currentContent: string,
  codeSnippet: string
): string {
  let newContent = currentContent

  // datasource db 블록만 있는 경우
  if (codeSnippet.includes('datasource db') && !codeSnippet.includes('generator client')) {
    const datasourceRegex = /datasource\s+db\s*\{[^}]*\}/s
    if (datasourceRegex.test(currentContent)) {
      newContent = currentContent.replace(datasourceRegex, codeSnippet.trim())
    } else {
      newContent = currentContent + '\n\n' + codeSnippet.trim()
    }
    return newContent
  }

  // model 정의만 있는 경우
  if (codeSnippet.includes('model ')) {
    const modelMatch = codeSnippet.match(/model\s+(\w+)/)
    if (modelMatch) {
      const modelName = modelMatch[1]
      const modelRegex = new RegExp(`model\\s+${modelName}\\s*\\{[^}]*\\}`, 's')

      if (modelRegex.test(currentContent)) {
        newContent = currentContent.replace(modelRegex, codeSnippet.trim())
      } else {
        newContent = currentContent + '\n\n' + codeSnippet.trim()
      }
    }
    return newContent
  }

  // enum 정의만 있는 경우
  if (codeSnippet.includes('enum ')) {
    const enumMatches = codeSnippet.matchAll(/enum\s+(\w+)\s*\{[^}]*\}/gs)

    for (const match of enumMatches) {
      const enumName = match[1]
      const enumCode = match[0]
      const enumRegex = new RegExp(`enum\\s+${enumName}\\s*\\{[^}]*\\}`, 's')

      if (enumRegex.test(newContent)) {
        newContent = newContent.replace(enumRegex, enumCode.trim())
      } else {
        // enum 없으면 model 앞에 추가
        const modelIndex = newContent.indexOf('model ')
        if (modelIndex > 0) {
          newContent = newContent.slice(0, modelIndex) + enumCode.trim() + '\n\n' + newContent.slice(modelIndex)
        } else {
          newContent = newContent + '\n\n' + enumCode.trim()
        }
      }
    }
    return newContent
  }

  // 알 수 없는 경우 그대로 반환
  return currentContent
}
