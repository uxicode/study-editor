import type { CurriculumStep } from '@/types/curriculum'

export const week_2_5_p3: CurriculumStep = {
  id: 'week-2-5-p3',
  title: '1주차 · 연습 ③ 정규화와 N:M 조인 테이블 — 복합 PK 의 중복 방지',
  order: 20,
  category: 'relations',
  content: {
    mission:
      '조인 테이블에 별도 `id` 대신 `(student_id, course_id)` 복합 PK 를 쓰면 같은 학생이 같은 강의를 두 번 신청하는 것이 어떻게 막히는지 `중복` 이라는 단어를 넣어 주석으로 설명하세요.',
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
      '복합 PK 가 중복 신청을 막는 원리 설명',
      '직전 스텝(정규화와 N:M 조인 테이블)의 내용을 스스로 적용하기'
    ],
    expectedOutput: '복합 PK 의 중복 방지 — 모든 채점 항목 통과'
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
        pattern: /--[^\n]*중복/,
        message: '복합 PK 의 중복 방지 효과를 -- 주석으로 설명해야 합니다.'
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
      content: '같은 (student_id, course_id) 쌍을 두 번 INSERT 하면 PK 충돌로 거부됩니다. 주석에 `중복` 이라는 단어를 넣어 설명하세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- 복합 PK 의 중복 방지 효과를 -- 주석으로 설명해야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `-- 복합 PK 때문에 같은 (학생, 강의) 쌍은 중복 INSERT 가 거부됩니다.
`
    }
  ]
}
