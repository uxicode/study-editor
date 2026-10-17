import type { CurriculumStep } from '@/types/curriculum'

export const week_2_5_p2: CurriculumStep = {
  id: 'week-2-5-p2',
  title: '1주차 · 연습 ② 정규화와 N:M 조인 테이블 — 조인 테이블에 속성 추가',
  order: 19,
  category: 'relations',
  content: {
    mission:
      '`enrollments` 에 `enrolled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP` 컬럼을 추가하세요. 조인 테이블이 관계 자체의 `속성` 을 담을 수 있다는 점을 주석으로 설명하세요.',
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
      '관계 자체의 속성(수강 신청 시각) 담기',
      '직전 스텝(정규화와 N:M 조인 테이블)의 내용을 스스로 적용하기'
    ],
    expectedOutput: '조인 테이블에 속성 추가 — 모든 채점 항목 통과'
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
  title VARCHAR(100) NOT NULL
);

CREATE TABLE enrollments (
  student_id INT NOT NULL,
  course_id  INT NOT NULL,
  PRIMARY KEY (student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id)  REFERENCES courses(id)  ON DELETE CASCADE
);

-- TODO: 아래에 이 문제의 풀이를 작성하세요.
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /\benrolled_at\s+DATETIME[^,]*DEFAULT\s+CURRENT_TIMESTAMP/i,
        message: 'enrolled_at DATETIME ... DEFAULT CURRENT_TIMESTAMP 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /--[^\n]*속성/,
        message: '조인 테이블의 속성에 대한 설명을 -- 주석으로 적어야 합니다.'
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
      content: '`enrolled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP` 를 추가하고 주석에 `속성` 이라는 단어를 넣어 설명하세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- enrolled_at DATETIME ... DEFAULT CURRENT_TIMESTAMP 가 필요합니다.
- 조인 테이블의 속성에 대한 설명을 -- 주석으로 적어야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `-- 조인 테이블은 관계 자체의 속성(수강 신청 시각)도 담을 수 있습니다.
CREATE TABLE enrollments (
  student_id  INT      NOT NULL,
  course_id   INT      NOT NULL,
  enrolled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id)  REFERENCES courses(id)  ON DELETE CASCADE
);
`
    }
  ]
}
