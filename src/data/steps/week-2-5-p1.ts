import type { CurriculumStep } from '@/types/curriculum'

export const week_2_5_p1: CurriculumStep = {
  id: 'week-2-5-p1',
  title: '1주차 · 연습 ① 정규화와 N:M 조인 테이블 — students · courses · enrollments',
  order: 18,
  category: 'relations',
  content: {
    mission:
      '`students`, `courses` 테이블과 N:M 조인 테이블 `enrollments(student_id, course_id)` 를 만들고 복합 기본키와 양쪽 외래키를 정의하세요.',
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
      'N:M 조인 테이블과 복합 PK 직접 설계',
      '직전 스텝(정규화와 N:M 조인 테이블)의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'students · courses · enrollments — 모든 채점 항목 통과'
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
        pattern: /CREATE\s+TABLE\s+`?students`?\s*\(/i,
        message: 'students 테이블이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+`?courses`?\s*\(/i,
        message: 'courses 테이블이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+`?enrollments`?\s*\(/i,
        message: 'enrollments 조인 테이블이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /PRIMARY\s+KEY\s*\(\s*student_id\s*,\s*course_id\s*\)/i,
        message: 'PRIMARY KEY (student_id, course_id) 복합 PK 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /FOREIGN\s+KEY\s*\(\s*student_id\s*\)\s*REFERENCES\s+`?students`?\s*\(\s*id\s*\)/i,
        message: 'student_id → students(id) 외래키가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /FOREIGN\s+KEY\s*\(\s*course_id\s*\)\s*REFERENCES\s+`?courses`?\s*\(\s*id\s*\)/i,
        message: 'course_id → courses(id) 외래키가 필요합니다.'
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
      content: '`enrollments` 에 `student_id`, `course_id` 를 두고 `PRIMARY KEY (student_id, course_id)` 와 두 개의 `FOREIGN KEY` 를 정의하세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- students 테이블이 필요합니다.
- courses 테이블이 필요합니다.
- enrollments 조인 테이블이 필요합니다.
- PRIMARY KEY (student_id, course_id) 복합 PK 가 필요합니다.
- student_id → students(id) 외래키가 필요합니다.
- course_id → courses(id) 외래키가 필요합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `CREATE TABLE students (
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
`
    }
  ]
}
