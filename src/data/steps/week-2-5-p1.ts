import type { CurriculumStep } from '@/types/curriculum'

export const week_2_5_p1: CurriculumStep = {
  id: 'week-2-5-p1',
  title: '1주차 · 연습 ① 정규화와 N:M 조인 테이블 — 수강신청 테이블 설계',
  order: 18,
  category: 'relations',
  content: {
    mission: '학생과 강의의 N:M 관계를 `students`, `courses`, `enrollments` 세 테이블로 설계하세요.',
    theory: `
      ## 복습: N:M 관계와 조인 테이블

      \`\`\`sql
      CREATE TABLE post_tags (
        post_id INT NOT NULL,
        tag_id  INT NOT NULL,
        PRIMARY KEY (post_id, tag_id),
        FOREIGN KEY (post_id) REFERENCES posts(id),
        FOREIGN KEY (tag_id)  REFERENCES tags(id)
      );
      \`\`\`

      - 두 외래키를 묶은 복합 PK 가 같은 쌍의 중복을 막습니다.
      - 조인 테이블에는 관계 자체의 속성(생성 시각 등)을 추가할 수 있습니다.
    `,
    objectives: [
      'N:M 관계를 조인 테이블로 풀기',
      '한 칸에 여러 값을 넣는 설계의 문제 이해',
      '직전 스텝(정규화와 N:M 조인 테이블)의 내용을 스스로 적용하기'
    ],
    exercise: `
**상황**
온라인 강의 플랫폼에서 학생은 여러 강의를 듣고, 한 강의에는 여러 학생이 수강합니다. 기존 시스템은 \`courses\` 테이블의 \`student_ids\` 컬럼에 \`'1,3,5'\` 처럼 학생 번호를 쉼표로 이어 저장하고 있었습니다.

**요구사항**
1. \`students\` 테이블을 만드세요. (포함할 컬럼: \`id\`, \`name\`)
2. \`courses\` 테이블을 만드세요. (포함할 컬럼: \`id\`, \`title\`)
3. 어떤 학생이 어떤 강의를 신청했는지 저장하는 \`enrollments\` 테이블을 만드세요. (포함할 컬럼: \`student_id\`, \`course_id\`)
   - 별도의 \`id\` 없이 두 컬럼의 조합으로 행을 식별합니다.
   - 두 컬럼은 각각 \`students\`, \`courses\` 를 참조하고, 학생이나 강의가 삭제되면 신청 기록도 삭제됩니다.

**생각해 보기** (\`--\` 주석으로 작성)
- \`student_ids\` 에 \`'1,3,5'\` 처럼 저장하는 방식에서 "3번 학생이 듣는 강의 찾기" 나 "학생 삭제" 가 어려운 이유를 서술해 주세요.
    `.trim(),
    expectedOutput: '수강신청 테이블 설계 — 모든 채점 항목 통과'
  },
  initialFiles: [
    {
      name: 'schema.sql',
      path: 'schema.sql',
      language: 'sql',
      content: `-- TODO: 아래에 이 문제의 풀이를 작성하세요.
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?students\s*\(/i,
        message: 'students 테이블을 만들어야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?courses\s*\(/i,
        message: 'courses 테이블을 만들어야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?enrollments\s*\(/i,
        message: 'enrollments 테이블을 만들어야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /PRIMARY\s+KEY\s*\(\s*(?:student_id\s*,\s*course_id|course_id\s*,\s*student_id)\s*\)/i,
        message: 'enrollments 는 두 컬럼의 조합으로 행을 식별해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /FOREIGN\s+KEY\s*\(\s*student_id\s*\)\s*REFERENCES\s+students\s*\(\s*id\s*\)\s*ON\s+DELETE\s+CASCADE/i,
        message: 'student_id 는 students(id) 를 참조하고 함께 삭제되어야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /FOREIGN\s+KEY\s*\(\s*course_id\s*\)\s*REFERENCES\s+courses\s*\(\s*id\s*\)\s*ON\s+DELETE\s+CASCADE/i,
        message: 'course_id 는 courses(id) 를 참조하고 함께 삭제되어야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /--[^\n]*(?:쉼표|콤마|문자열|검색|정규화|외래키|FK)/i,
        message: '쉼표로 이어 저장하는 방식의 문제를 -- 주석으로 서술해야 합니다.'
      }
    ],
    dynamicChecks: [
      {
        type: 'result',
        test: (result: unknown) => Boolean((result as { success?: boolean }).success),
        message: 'SQL 이 정상적으로 분석되어야 합니다.'
      }
    ]
  },
  hints: [
    {
      level: 1,
      content: 'N:M 은 양쪽을 참조하는 조인 테이블로 풉니다. `PRIMARY KEY (student_id, course_id)` 처럼 두 컬럼을 묶어 기본키로 쓸 수 있습니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- students 테이블을 만들어야 합니다.
- courses 테이블을 만들어야 합니다.
- enrollments 테이블을 만들어야 합니다.
- enrollments 는 두 컬럼의 조합으로 행을 식별해야 합니다.
- student_id 는 students(id) 를 참조하고 함께 삭제되어야 합니다.
- course_id 는 courses(id) 를 참조하고 함께 삭제되어야 합니다.
- 쉼표로 이어 저장하는 방식의 문제를 -- 주석으로 서술해야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `-- '1,3,5' 는 하나의 문자열이라 3번 학생을 찾으려면 모든 행의 문자열을 잘라 비교해야 하고,
-- 외래키를 걸 수 없어 학생이 삭제돼도 번호가 남습니다. 조인 테이블로 나누면 행 단위로 찾고 지울 수 있습니다.
CREATE TABLE students (
  id   INT          AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE courses (
  id    INT          AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL
);

CREATE TABLE enrollments (
  student_id INT NOT NULL,
  course_id  INT NOT NULL,
  PRIMARY KEY (student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id)  REFERENCES courses(id)  ON DELETE CASCADE
);
`
    }
  ]
}
