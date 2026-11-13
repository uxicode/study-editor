import type { CurriculumStep } from '@/types/curriculum'

export const week_2_5_p2: CurriculumStep = {
  id: 'week-2-5-p2',
  title: '1주차 · 연습 ② 정규화와 N:M 조인 테이블 — 신청 일시와 성적은 어디에 둘까',
  order: 19,
  category: 'relations',
  content: {
    mission: '수강 신청 일시와 성적을 어느 테이블에 둘지 판단해 `enrollments` 에 컬럼을 추가하세요.',
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
      '관계 자체의 속성을 조인 테이블에 두기',
      '속성의 위치를 판단하는 기준 이해',
      '직전 스텝(정규화와 N:M 조인 테이블)의 내용을 스스로 적용하기'
    ],
    exercise: `
**상황**
수강신청 기능에 "신청 일시" 와 "최종 성적(A~F)" 을 저장해 달라는 요청이 들어왔습니다. 한 팀원은 \`students\` 에, 다른 팀원은 \`courses\` 에 컬럼을 추가하자고 의견이 갈렸습니다.

**요구사항**
1. 아래 \`enrollments\` 테이블을 고쳐 신청 일시 \`enrolled_at\` 을 추가하세요. 값을 주지 않으면 저장 시점의 시각으로 채워집니다.
2. 같은 테이블에 성적 \`grade\` 를 추가하세요. 최대 2자(\`'A+'\` 등)이며, 성적이 나오기 전에는 비어 있을 수 있습니다.

**생각해 보기** (\`--\` 주석으로 작성)
- 두 값을 \`students\` 나 \`courses\` 가 아니라 \`enrollments\` 에 두어야 하는 이유를 서술해 주세요. (한 학생이 강의 3개를 들으면 성적은 몇 개인가요?)
    `.trim(),
    expectedOutput: '신청 일시와 성적은 어디에 둘까 — 모든 채점 항목 통과'
  },
  initialFiles: [
    {
      name: 'schema.sql',
      path: 'schema.sql',
      language: 'sql',
      content: `CREATE TABLE students (
  id   INT          AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE courses (
  id    INT          AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL
);

-- TODO: 아래 enrollments 정의를 고쳐 이 문제를 풀어 보세요.
CREATE TABLE enrollments (
  student_id INT NOT NULL,
  course_id  INT NOT NULL,
  PRIMARY KEY (student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id)  REFERENCES courses(id)  ON DELETE CASCADE
);
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+enrollments\s*\([^;]*enrolled_at\s+(?:DATETIME|TIMESTAMP)\b[^,\n]*DEFAULT\s+(?:CURRENT_TIMESTAMP|NOW\s*\(\s*\))/i,
        message: 'enrollments 에 저장 시점으로 채워지는 enrolled_at 이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+enrollments\s*\([^;]*grade\s+(?:VAR)?CHAR\s*\(\s*2\s*\)(?![^,\n]*NOT\s+NULL)/i,
        message: 'enrollments 에 비어 있을 수 있는 최대 2자 grade 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /PRIMARY\s+KEY\s*\(\s*student_id\s*,\s*course_id\s*\)/i,
        message: 'enrollments 의 복합 기본키는 유지해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /--[^\n]*(?:관계|조합|학생과 강의|학생마다|강의마다|여러)/,
        message: '두 값을 enrollments 에 두는 이유를 -- 주석으로 서술해야 합니다.'
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
      content: '"이 학생이 이 강의를" 신청한 시각과 받은 성적은 학생 하나나 강의 하나가 아니라 **둘의 조합** 에 딸린 정보입니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- enrollments 에 저장 시점으로 채워지는 enrolled_at 이 필요합니다.
- enrollments 에 비어 있을 수 있는 최대 2자 grade 가 필요합니다.
- enrollments 의 복합 기본키는 유지해야 합니다.
- 두 값을 enrollments 에 두는 이유를 -- 주석으로 서술해야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `-- 신청 일시와 성적은 "어떤 학생이 어떤 강의를" 이라는 관계(조합)마다 하나씩 생기는 값입니다.
-- 학생이 강의 3개를 들으면 성적도 3개라, students 나 courses 의 한 칸에는 담을 수 없습니다.
CREATE TABLE students (
  id   INT          AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE courses (
  id    INT          AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL
);

CREATE TABLE enrollments (
  student_id  INT        NOT NULL,
  course_id   INT        NOT NULL,
  enrolled_at DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  grade       VARCHAR(2),
  PRIMARY KEY (student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id)  REFERENCES courses(id)  ON DELETE CASCADE
);
`
    }
  ]
}
