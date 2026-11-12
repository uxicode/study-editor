import type { SqlCheck, StepSqlSpec } from '@/types/sql-check'

/**
 * SQL 스텝의 실행 기반 채점 설정.
 *
 * 학습자의 SQL 을 SQLite(sql.js)에서 실제로 실행한 뒤, 구조(PRAGMA)와 동작(제약 위반·쿼리 결과)을 검사한다.
 * 여기에 등록된 스텝은 구조를 확인하던 정규식 정적 검사를 대체하고, '주석' 요구 검사만 정적으로 남는다.
 * 주석만으로 답하는 스텝(week-2-2-p3 등)은 등록하지 않는다.
 */

const table = (name: string, message = `${name} 테이블을 생성해야 합니다.`): SqlCheck => ({
  type: 'table',
  table: name,
  message
})

const column = (
  tableName: string,
  columnName: string,
  options: { sqlType?: string; notNull?: boolean; defaultValue?: string },
  message: string
): SqlCheck => ({ type: 'column', table: tableName, column: columnName, ...options, message })

const primaryKey = (tableName: string, columns: string[], message: string): SqlCheck => ({
  type: 'primaryKey',
  table: tableName,
  columns,
  message
})

const foreignKey = (
  tableName: string,
  columnName: string,
  refTable: string,
  onDelete: 'CASCADE' | 'SET NULL' | undefined,
  message: string
): SqlCheck => ({
  type: 'foreignKey',
  table: tableName,
  column: columnName,
  refTable,
  refColumn: 'id',
  ...(onDelete ? { onDelete } : {}),
  message
})

/** `id` 가 자동 증가하는지: 두 행을 넣으면 1, 2 가 붙어야 한다 */
const autoIncrement = (tableName: string, insertColumns: string, valueRows: [string, string], message: string): SqlCheck => ({
  type: 'query',
  setup: `INSERT INTO ${tableName} (${insertColumns}) VALUES (${valueRows[0]}), (${valueRows[1]})`,
  sql: `SELECT id FROM ${tableName} ORDER BY id`,
  expect: [[1], [2]],
  message
})

const BLOG_SCHEMA = `
CREATE TABLE users (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(255) NOT NULL UNIQUE,
  name       VARCHAR(100) NOT NULL,
  role       VARCHAR(20)  NOT NULL DEFAULT 'user',
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE posts (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  user_id    INT          NOT NULL,
  title      VARCHAR(255) NOT NULL,
  content    TEXT,
  status     VARCHAR(20)  NOT NULL DEFAULT 'draft',
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE comments (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  post_id    INT          NOT NULL,
  user_id    INT,
  body       TEXT         NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE TABLE tags (
  id   INT         AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);
CREATE TABLE post_tags (
  post_id INT NOT NULL,
  tag_id  INT NOT NULL,
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id)  REFERENCES tags(id)  ON DELETE CASCADE
);
`

/** EXPLAIN 실습용 숨은 스키마: users.email 에는 인덱스(UNIQUE)가 있고 name 과 posts 에는 없다 */
const EXPLAIN_SCHEMA = `
CREATE TABLE users (
  id    INT          AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name  VARCHAR(100) NOT NULL
);
CREATE TABLE posts (
  id         INT      AUTO_INCREMENT PRIMARY KEY,
  user_id    INT      NOT NULL,
  title      VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`

/** Prisma ↔ SQL 대조 실습용 숨은 스키마: @@map("users") / @@map("posts") 로 매핑된 테이블 */
const ORM_SCHEMA = `
CREATE TABLE users (
  id    INT          AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name  VARCHAR(100) NOT NULL,
  role  VARCHAR(20)  NOT NULL DEFAULT 'user'
);
CREATE TABLE posts (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  user_id    INT          NOT NULL,
  title      VARCHAR(255) NOT NULL,
  published  BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`

const USER_FIXTURE = (names: string[]): string =>
  `INSERT INTO users (email, name) VALUES ${names.map((n, i) => `('${n.toLowerCase()}${i + 1}@example.com', '${n}')`).join(', ')};`

export const SQL_STEP_SPECS: Record<string, StepSqlSpec> = {
  // ── Week 1 · CREATE TABLE ────────────────────────────────────────────────
  'week-2-1': {
    checks: [
      table('users', 'users 테이블을 생성하는 CREATE TABLE 문이 필요합니다.'),
      column('users', 'id', { sqlType: 'INT' }, 'id INT 컬럼이 필요합니다.'),
      column('users', 'email', { sqlType: 'VARCHAR(255)' }, 'email VARCHAR(255) 컬럼이 필요합니다.'),
      column('users', 'name', { sqlType: 'VARCHAR(100)' }, 'name VARCHAR(100) 컬럼이 필요합니다.')
    ]
  },
  'week-2-1-p1': {
    checks: [
      table('posts'),
      column('posts', 'id', { sqlType: 'INT' }, 'posts.id INT 컬럼이 필요합니다.'),
      column('posts', 'title', { sqlType: 'VARCHAR(200)' }, 'title VARCHAR(200) 컬럼이 필요합니다.'),
      column('posts', 'content', { sqlType: 'TEXT' }, 'content TEXT 컬럼이 필요합니다.')
    ]
  },
  'week-2-1-p2': {
    checks: [
      table('tags'),
      column('tags', 'id', { sqlType: 'INT' }, 'tags.id INT 컬럼이 필요합니다.'),
      column('tags', 'name', { sqlType: 'VARCHAR(50)' }, 'tags 에 name VARCHAR(50) 컬럼이 필요합니다.')
    ]
  },
  'week-2-1-p3': {
    checks: [
      table('products'),
      column('products', 'id', { sqlType: 'INT' }, 'products.id INT 컬럼이 필요합니다.'),
      column('products', 'name', { sqlType: 'VARCHAR(100)' }, 'products.name VARCHAR(100) 컬럼이 필요합니다.'),
      column('products', 'price', { sqlType: 'DECIMAL(10,2)' }, 'price DECIMAL(10,2) 컬럼이 필요합니다.'),
      column('products', 'created_at', { sqlType: 'DATETIME' }, 'created_at DATETIME 컬럼이 필요합니다.')
    ]
  },

  // ── AUTO_INCREMENT · PRIMARY KEY ─────────────────────────────────────────
  'week-2-2': {
    checks: [
      primaryKey('users', ['id'], 'users.id 가 PRIMARY KEY 여야 합니다.'),
      autoIncrement('users', 'email, name', ["'a@a.com', 'A'", "'b@b.com', 'B'"], 'users.id 는 AUTO_INCREMENT 로 1, 2, ... 자동 증가해야 합니다.')
    ]
  },
  'week-2-2-p1': {
    checks: [
      table('posts'),
      primaryKey('posts', ['id'], 'posts.id 를 PRIMARY KEY 로 정의해야 합니다.'),
      autoIncrement('posts', 'title', ["'a'", "'b'"], 'posts.id 를 INT AUTO_INCREMENT 로 정의해야 합니다.'),
      column('posts', 'title', { sqlType: 'VARCHAR(200)', notNull: true }, 'posts 에 title VARCHAR(200) NOT NULL 이 필요합니다.')
    ]
  },
  'week-2-2-p2': {
    checks: [
      table('tags'),
      primaryKey('tags', ['id'], 'tags.id 를 PRIMARY KEY 로 정의해야 합니다.'),
      autoIncrement('tags', 'name', ["'a'", "'b'"], 'tags.id 를 INT AUTO_INCREMENT 로 정의해야 합니다.'),
      column('tags', 'name', { sqlType: 'VARCHAR(50)', notNull: true }, 'tags 에 name VARCHAR(50) NOT NULL 이 필요합니다.')
    ]
  },

  // ── 제약조건 ───────────────────────────────────────────────────────────
  'week-2-3': {
    checks: [
      column('users', 'email', { notNull: true }, 'email 컬럼에 NOT NULL 이 필요합니다.'),
      { type: 'rejects', constraint: 'UNIQUE', sql: "INSERT INTO users (email, name) VALUES ('a@a.com', 'A'), ('a@a.com', 'B')", message: 'email 컬럼에 UNIQUE 제약이 필요합니다.' },
      column('users', 'name', { notNull: true }, 'name 컬럼에 NOT NULL 이 필요합니다.'),
      column('users', 'role', { sqlType: 'VARCHAR(20)', defaultValue: 'user' }, "role VARCHAR(20) 컬럼에 DEFAULT 'user' 가 필요합니다."),
      {
        type: 'query',
        setup: "INSERT INTO users (email, name) VALUES ('a@a.com', 'A')",
        sql: 'SELECT role FROM users',
        expect: [['user']],
        message: "role 을 생략하고 INSERT 하면 기본값 'user' 가 들어가야 합니다."
      },
      { type: 'rejects', constraint: 'CHECK', sql: "INSERT INTO users (email, name, age) VALUES ('a@a.com', 'A', -1)", message: 'age 컬럼에 CHECK (age >= 0) 제약이 필요합니다.' },
      { type: 'accepts', sql: "INSERT INTO users (email, name, age) VALUES ('a@a.com', 'A', 20)", message: 'age 가 0 이상이면 INSERT 가 가능해야 합니다.' }
    ]
  },
  'week-2-3-p1': {
    checks: [
      table('posts'),
      column('posts', 'title', { sqlType: 'VARCHAR(200)', notNull: true }, 'title VARCHAR(200) NOT NULL 이 필요합니다.'),
      column('posts', 'view_count', { sqlType: 'INT', notNull: true }, 'view_count INT 에 NOT NULL 이 필요합니다.'),
      column('posts', 'view_count', { defaultValue: '0' }, 'view_count 에 DEFAULT 0 이 필요합니다.')
    ]
  },
  'week-2-3-p2': {
    checks: [
      table('products'),
      column('products', 'price', { sqlType: 'DECIMAL(10,2)', notNull: true }, 'price DECIMAL(10,2) NOT NULL 이 필요합니다.'),
      { type: 'rejects', constraint: 'CHECK', sql: "INSERT INTO products (name, price) VALUES ('x', -1)", message: 'price 에 CHECK (price >= 0) 이 필요합니다.' },
      column('products', 'stock', { sqlType: 'INT', notNull: true, defaultValue: '0' }, 'stock INT NOT NULL DEFAULT 0 이 필요합니다.'),
      { type: 'rejects', constraint: 'CHECK', sql: "INSERT INTO products (name, price, stock) VALUES ('x', 1, -1)", message: 'stock 에 CHECK (stock >= 0) 이 필요합니다.' },
      { type: 'accepts', sql: "INSERT INTO products (name, price) VALUES ('x', 1)", message: 'price 와 stock 이 0 이상이면 INSERT 가 가능해야 합니다.' }
    ]
  },
  'week-2-3-p3': {
    checks: [
      table('members'),
      {
        type: 'rejects', constraint: 'UNIQUE',
        setup: "INSERT INTO members (first_name, last_name) VALUES ('Gildong', 'Hong')",
        sql: "INSERT INTO members (first_name, last_name) VALUES ('Gildong', 'Hong')",
        message: 'UNIQUE (first_name, last_name) 복합 제약이 필요합니다. 이름과 성이 모두 같은 행은 거부되어야 합니다.'
      },
      {
        type: 'accepts',
        setup: "INSERT INTO members (first_name, last_name) VALUES ('Gildong', 'Hong')",
        sql: "INSERT INTO members (first_name, last_name) VALUES ('Cheolsu', 'Hong')",
        message: '성만 같은 경우는 허용되어야 합니다. first_name 과 last_name 을 묶은 UNIQUE (first_name, last_name) 를 사용하세요.'
      }
    ]
  },

  // ── 외래키 ─────────────────────────────────────────────────────────────
  'week-2-4': {
    checks: [
      table('posts'),
      column('posts', 'user_id', { sqlType: 'INT', notNull: true }, 'posts.user_id INT NOT NULL 컬럼이 필요합니다.'),
      foreignKey('posts', 'user_id', 'users', 'CASCADE', 'posts.user_id 가 users(id) 를 참조하는 FOREIGN KEY ... ON DELETE CASCADE 가 필요합니다.'),
      {
        type: 'query',
        setup: "INSERT INTO users (email, name) VALUES ('a@a.com', 'A'); INSERT INTO posts (user_id, title) VALUES (1, 't'); DELETE FROM users WHERE id = 1",
        sql: 'SELECT COUNT(*) FROM posts',
        expect: [[0]],
        message: '사용자를 삭제하면 그 사용자의 글도 함께 삭제되어야 합니다 (ON DELETE CASCADE).'
      }
    ]
  },
  'week-2-4-p1': {
    checks: [
      table('comments'),
      column('comments', 'post_id', { sqlType: 'INT', notNull: true }, 'comments.post_id INT NOT NULL 이 필요합니다.'),
      column('comments', 'content', { sqlType: 'TEXT', notNull: true }, 'content TEXT NOT NULL 이 필요합니다.'),
      foreignKey('comments', 'post_id', 'posts', 'CASCADE', 'comments.post_id 가 posts(id) 를 참조하는 FOREIGN KEY ... ON DELETE CASCADE 가 필요합니다.')
    ],
    keepStaticMessages: ['CONSTRAINT fk_comments_post']
  },
  'week-2-4-p2': {
    checks: [
      table('posts_archive'),
      column('posts_archive', 'user_id', { sqlType: 'INT', notNull: false }, 'posts_archive.user_id 는 NULL 을 허용하는 INT 여야 합니다.'),
      foreignKey('posts_archive', 'user_id', 'users', 'SET NULL', 'user_id 에 users(id) 를 참조하는 ON DELETE SET NULL 이 필요합니다.')
    ]
  },

  // ── N:M 조인 테이블 ───────────────────────────────────────────────────────
  'week-2-5': {
    checks: [
      table('tags'),
      table('post_tags', 'post_tags 조인 테이블을 생성해야 합니다.'),
      primaryKey('post_tags', ['post_id', 'tag_id'], '(post_id, tag_id) 복합 기본키가 필요합니다.'),
      foreignKey('post_tags', 'post_id', 'posts', undefined, 'post_id 가 posts(id) 를 참조하는 외래키가 필요합니다.'),
      foreignKey('post_tags', 'tag_id', 'tags', undefined, 'tag_id 가 tags(id) 를 참조하는 외래키가 필요합니다.')
    ]
  },
  'week-2-5-p1': {
    checks: [
      table('students', 'students 테이블이 필요합니다.'),
      table('courses', 'courses 테이블이 필요합니다.'),
      table('enrollments', 'enrollments 조인 테이블이 필요합니다.'),
      primaryKey('enrollments', ['student_id', 'course_id'], 'PRIMARY KEY (student_id, course_id) 복합 PK 가 필요합니다.'),
      foreignKey('enrollments', 'student_id', 'students', undefined, 'student_id → students(id) 외래키가 필요합니다.'),
      foreignKey('enrollments', 'course_id', 'courses', undefined, 'course_id → courses(id) 외래키가 필요합니다.')
    ]
  },
  'week-2-5-p2': {
    checks: [
      column(
        'enrollments',
        'enrolled_at',
        { sqlType: 'DATETIME', notNull: true, defaultValue: 'CURRENT_TIMESTAMP' },
        'enrolled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP 컬럼이 필요합니다.'
      )
    ]
  },

  // ── SELECT · JOIN (queries.sql) ──────────────────────────────────────────
  'week-2-6': {
    checks: [
      { type: 'query', sql: 'SELECT COUNT(*) >= 2 FROM users', expect: [[1]], message: 'users 테이블에 사용자를 2명 이상 INSERT 해야 합니다.' },
      { type: 'query', sql: 'SELECT COUNT(*) >= 1 FROM posts', expect: [[1]], message: 'posts 테이블에 글을 1개 이상 INSERT 해야 합니다.' },
      {
        type: 'learnerSelect',
        fixture:
          "INSERT INTO users (email, name) VALUES ('a@a.com', 'A'); " +
          Array.from({ length: 12 }, (_, i) => `INSERT INTO posts (user_id, title) VALUES (1, 'post ${i + 1}');`).join(' '),
        expect: { column: { name: 'id', values: [12, 11, 10, 9, 8, 7, 6, 5, 4, 3], ordered: true } },
        message: 'posts 를 id 내림차순(최신순)으로 정렬해 10개만 조회하는 SELECT 가 필요합니다 (id 컬럼을 포함하세요).'
      },
      {
        type: 'learnerSelect',
        fixture:
          "INSERT INTO users (email, name) VALUES ('a@a.com', 'Alice'), ('b@b.com', 'Bob'); " +
          "INSERT INTO posts (user_id, title) VALUES (1, 'T1'), (1, 'T2'), (2, 'T3');",
        expect: { rows: [['T1', 'Alice'], ['T2', 'Alice'], ['T3', 'Bob']] },
        message: '글 제목과 작성자 이름을 함께 조회하는 posts INNER JOIN users 쿼리가 필요합니다.'
      },
      {
        type: 'learnerSelect',
        fixture:
          "INSERT INTO users (email, name) VALUES ('a@a.com', 'Alice'), ('b@b.com', 'Bob'); " +
          "INSERT INTO posts (user_id, title) VALUES (1, 'T1'), (1, 'T2');",
        expect: { rows: [['Alice', 2], ['Bob', 0]] },
        message: '사용자별 글 수를 세는 LEFT JOIN + GROUP BY 쿼리가 필요합니다 (글이 없는 사용자는 0 으로 나와야 합니다).'
      }
    ]
  },
  'week-2-6-p1': {
    checks: [
      {
        type: 'learnerSelect',
        fixture:
          "INSERT INTO users (email, name) VALUES ('a@a.com', 'A'); " +
          [
            'SQL one',
            'Cooking',
            'SQL two',
            'Travel',
            'SQL three',
            'SQL four',
            'Gaming',
            'SQL five',
            'SQL six',
            'SQL seven'
          ]
            .map((title) => `INSERT INTO posts (user_id, title) VALUES (1, '${title}');`)
            .join(' '),
        expect: { column: { name: 'id', values: [10, 9, 8, 6, 5], ordered: true } },
        message: "WHERE title LIKE '%SQL%' ORDER BY id DESC LIMIT 5 쿼리가 필요합니다 (id 컬럼을 포함하세요)."
      }
    ]
  },
  'week-2-6-p2': {
    checks: [
      {
        type: 'learnerSelect',
        fixture:
          `${USER_FIXTURE(['Alice', 'Bob', 'Carol'])} ` +
          "INSERT INTO posts (user_id, title) VALUES (1, 'a'), (1, 'b'), (1, 'c'), (2, 'd'), (2, 'e');",
        expect: { rows: [['Alice']] },
        message: 'GROUP BY ... HAVING COUNT(p.id) >= 3 으로 글을 3개 이상 쓴 사용자만 조회해야 합니다.'
      }
    ]
  },
  'week-2-6-p3': {
    checks: [
      {
        type: 'learnerSelect',
        fixture: `${USER_FIXTURE(['Alice', 'Bob', 'Carol'])} INSERT INTO posts (user_id, title) VALUES (1, 'a');`,
        expect: { rows: [['Bob'], ['Carol']] },
        message: '글을 한 개도 쓰지 않은 사용자만 조회하는 LEFT JOIN posts ... WHERE p.id IS NULL 쿼리가 필요합니다.'
      }
    ]
  },

  // ── 종합 · 블로그 스키마 ───────────────────────────────────────────────────
  'week-2-final': {
    checks: [
      table('users', 'users 테이블이 필요합니다.'),
      table('posts', 'posts 테이블이 필요합니다.'),
      table('comments', 'comments 테이블이 필요합니다.'),
      table('tags', 'tags 테이블이 필요합니다.'),
      table('post_tags', 'post_tags 조인 테이블이 필요합니다.'),
      foreignKey('posts', 'user_id', 'users', undefined, 'posts.user_id → users(id) 외래키가 필요합니다.'),
      foreignKey('comments', 'post_id', 'posts', undefined, 'comments.post_id → posts(id) 외래키가 필요합니다.'),
      foreignKey('comments', 'user_id', 'users', undefined, 'comments.user_id → users(id) 외래키가 필요합니다.'),
      primaryKey('post_tags', ['post_id', 'tag_id'], 'post_tags 의 (post_id, tag_id) 복합 기본키가 필요합니다.'),
      foreignKey('post_tags', 'post_id', 'posts', undefined, 'post_tags.post_id → posts(id) 외래키가 필요합니다.'),
      foreignKey('post_tags', 'tag_id', 'tags', undefined, 'post_tags.tag_id → tags(id) 외래키가 필요합니다.')
    ]
  },
  'week-2-final-p1': {
    checks: [
      {
        type: 'rejects',
        constraint: 'CHECK',
        foreignKeys: false,
        sql: "INSERT INTO posts (user_id, title, status) VALUES (1, 't', 'archived')",
        message: "posts.status 에 CHECK (status IN ('draft', 'published')) 가 필요합니다. 다른 값은 거부되어야 합니다."
      },
      {
        type: 'accepts',
        foreignKeys: false,
        sql: "INSERT INTO posts (user_id, title, status) VALUES (1, 't', 'published'), (1, 'u', 'draft')",
        message: "status 가 'draft' 또는 'published' 이면 INSERT 가 가능해야 합니다."
      }
    ]
  },
  'week-2-final-p2': {
    prelude: BLOG_SCHEMA,
    checks: [
      {
        type: 'rejects',
        constraint: 'CHECK',
        sql: "INSERT INTO users (email, name, role) VALUES ('a@a.com', 'A', 'guest')",
        message: "users.role 에 CHECK (role IN ('user', 'admin')) 가 필요합니다. 다른 값은 거부되어야 합니다."
      },
      {
        type: 'accepts',
        sql: "INSERT INTO users (email, name, role) VALUES ('a@a.com', 'A', 'admin'), ('b@b.com', 'B', 'user')",
        message: "role 이 'user' 또는 'admin' 이면 INSERT 가 가능해야 합니다."
      },
      {
        type: 'index',
        table: 'posts',
        columns: ['user_id', 'created_at'],
        message: 'posts(user_id, created_at) 에 인덱스를 만들어야 합니다 (CREATE INDEX ... ON posts (user_id, created_at)).'
      }
    ]
  },
  'week-2-final-p3': {
    prelude: BLOG_SCHEMA,
    checks: [
      {
        type: 'learnerSelect',
        fixture:
          "INSERT INTO users (email, name) VALUES ('a@a.com', 'Alice'), ('b@b.com', 'Bob'); " +
          "INSERT INTO posts (user_id, title) VALUES (1, 'P1'), (1, 'P2'), (2, 'P3'); " +
          "INSERT INTO tags (name) VALUES ('sql'), ('js'); " +
          'INSERT INTO post_tags (post_id, tag_id) VALUES (1, 1), (2, 2), (3, 1);',
        expect: { rows: [['P1', 'Alice'], ['P3', 'Bob']] },
        message: "posts → post_tags → tags → users 를 JOIN 하고 태그 이름이 'sql' 인 글의 제목과 작성자 이름을 조회하는 SELECT 가 필요합니다."
      }
    ]
  },

  // ── EXPLAIN · 인덱스 ──────────────────────────────────────────────────────
  'week-4-5': {
    prelude: EXPLAIN_SCHEMA,
    checks: [
      {
        type: 'learnerSelect',
        expect: { contains: 'SCAN users' },
        message: '인덱스가 없는 name 컬럼으로 조회하는 EXPLAIN SELECT 가 필요합니다.'
      },
      {
        type: 'learnerSelect',
        expect: { contains: 'SEARCH users' },
        message: '인덱스가 있는 email 컬럼으로 조회하는 EXPLAIN SELECT 가 필요합니다.'
      }
    ]
  },
  'week-4-5-p1': {
    prelude: EXPLAIN_SCHEMA,
    checks: [
      {
        type: 'learnerSelect',
        expect: { contains: 'USE TEMP B-TREE FOR ORDER BY' },
        message: 'EXPLAIN SELECT * FROM posts WHERE user_id = 1 ORDER BY created_at DESC LIMIT 10 을 작성해야 합니다.'
      }
    ]
  },
  'week-4-5-p3': {
    prelude: EXPLAIN_SCHEMA,
    checks: [
      {
        type: 'index',
        table: 'posts',
        columns: ['user_id', 'created_at'],
        message: 'CREATE INDEX idx_posts_user_created ON posts (user_id, created_at) 이 필요합니다.'
      },
      {
        type: 'learnerSelect',
        expect: { contains: 'SEARCH posts' },
        message: '인덱스 생성 후 EXPLAIN SELECT ... FROM posts WHERE user_id = ... 를 다시 실행해야 합니다.'
      }
    ]
  },

  // ── Prisma 쿼리 ↔ SQL 대조 (queries.sql) ───────────────────────────────────
  'week-4-6': {
    prelude: ORM_SCHEMA,
    checks: [
      {
        type: 'learnerSelect',
        fixture: "INSERT INTO users (email, name, role) VALUES ('a@a.com', 'Alice', 'admin'), ('b@b.com', 'Bob', 'user'), ('c@c.com', 'Carol', 'admin');",
        expect: { column: { name: 'id', values: [1, 3], ordered: true }, rows: [[1, 'a@a.com'], [3, 'c@c.com']] },
        message: "① users 에서 role = 'admin' 인 사용자의 id, email 을 id 오름차순으로 조회하는 SELECT 가 필요합니다."
      },
      {
        type: 'learnerSelect',
        fixture:
          "INSERT INTO users (email, name) VALUES ('a@a.com', 'A'); " +
          ['SQL one', 'Cooking', 'SQL two', 'SQL three', 'Travel', 'SQL four']
            .map((title) => `INSERT INTO posts (user_id, title) VALUES (1, '${title}');`)
            .join(' '),
        expect: { column: { name: 'id', values: [6, 4, 3], ordered: true } },
        message: "② posts 에서 title 에 'SQL' 이 포함된 글을 id 내림차순으로 3개만 조회하는 SELECT 가 필요합니다 (id 컬럼을 포함하세요)."
      }
    ]
  },
  'week-4-6-p1': {
    prelude: ORM_SCHEMA,
    checks: [
      {
        type: 'learnerSelect',
        fixture:
          `${USER_FIXTURE(['Alice', 'Bob', 'Carol'])} ` +
          "INSERT INTO posts (user_id, title) VALUES (1, 'P1'), (2, 'P2'), (3, 'P3'), (1, 'P4');",
        expect: { rows: [['Alice'], ['Bob']] },
        message: '1) users 에서 id IN (1, 2) 인 사용자를 조회하는 SELECT 가 필요합니다.'
      },
      {
        type: 'learnerSelect',
        fixture:
          `${USER_FIXTURE(['Alice', 'Bob', 'Carol'])} ` +
          "INSERT INTO posts (user_id, title) VALUES (1, 'P1'), (2, 'P2'), (3, 'P3'), (1, 'P4');",
        expect: { column: { name: 'title', values: ['P1', 'P2', 'P4'] } },
        message: '2) posts 에서 user_id IN (1, 2) 인 글을 조회하는 SELECT 가 필요합니다 (title 컬럼을 포함하세요).'
      }
    ]
  },
  'week-4-6-p2': {
    prelude: ORM_SCHEMA,
    checks: [
      {
        type: 'learnerSelect',
        fixture:
          `${USER_FIXTURE(['Alice', 'Bob', 'Carol'])} ` +
          'INSERT INTO posts (user_id, title, published) VALUES ' +
          "(2, 'a', TRUE), (1, 'b', TRUE), (1, 'c', TRUE), (1, 'd', FALSE), (2, 'e', FALSE), (3, 'f', FALSE);",
        expect: {
          column: { name: 'post_count', values: [2, 1], ordered: true },
          rows: [[1, 2], [2, 1]]
        },
        message:
          '공개된 글만 user_id 별로 세는 SELECT 가 필요합니다 (COUNT(*) AS post_count, WHERE published = TRUE, GROUP BY user_id, ORDER BY user_id).'
      }
    ]
  }
}
