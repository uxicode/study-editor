import type { SqlCheck, StepSqlSpec } from '@/types/sql-check'

/**
 * SQL 스텝의 실행 기반 채점 설정.
 *
 * 학습자의 SQL 을 SQLite(sql.js)에서 실제로 실행한 뒤, 구조(PRAGMA)와 동작(제약 위반·쿼리 결과)을 검사한다.
 * 여기에 등록된 스텝은 구조를 확인하던 정규식 정적 검사를 대체하고, '주석' 요구 검사만 정적으로 남는다.
 * 주석만으로 답하는 스텝은 등록하지 않는다.
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

/** 기본키 컬럼(기본 `id`)이 자동 증가하는지: 두 행을 넣으면 1, 2 가 붙어야 한다 */
const autoIncrement = (
  tableName: string,
  insertColumns: string,
  valueRows: [string, string],
  message: string,
  idColumn = 'id'
): SqlCheck => ({
  type: 'query',
  setup: `INSERT INTO ${tableName} (${insertColumns}) VALUES (${valueRows[0]}), (${valueRows[1]})`,
  sql: `SELECT ${idColumn} FROM ${tableName} ORDER BY ${idColumn}`,
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
      table('posts', 'posts 테이블을 만들어야 합니다.'),
      column('posts', 'post_id', {}, 'posts 에 post_id 컬럼이 필요합니다.'),
      column('posts', 'title', { sqlType: 'VARCHAR(200)' }, 'title 은 최대 200자로 제한해야 합니다.'),
      column('posts', 'body', {}, 'posts 에 body 컬럼이 필요합니다.'),
      column('posts', 'published_at', {}, 'posts 에 published_at 컬럼이 필요합니다.')
    ],
    keepStaticMessages: ['post_id 는 정수', 'body 에 긴 글', 'published_at 은 날짜와 시각']
  },
  'week-2-1-p2': {
    checks: [
      table('user_profiles', 'user_profiles 테이블을 만들어야 합니다.'),
      column('user_profiles', 'user_id', {}, 'user_profiles 에 user_id 컬럼이 필요합니다.'),
      column('user_profiles', 'nickname', { sqlType: 'VARCHAR(30)' }, 'nickname 은 최대 30자로 제한해야 합니다.'),
      column('user_profiles', 'birth_date', { sqlType: 'DATE' }, 'birth_date 는 날짜만 담는 타입이어야 합니다.'),
      column('user_profiles', 'marketing_agreed', {}, 'user_profiles 에 marketing_agreed 컬럼이 필요합니다.')
    ],
    keepStaticMessages: ['marketing_agreed 는 참/거짓']
  },
  'week-2-1-p3': {
    checks: [
      table('products', 'products 테이블을 만들어야 합니다.'),
      column('products', 'product_id', {}, 'products 에 product_id 컬럼이 필요합니다.'),
      column('products', 'name', { sqlType: 'VARCHAR(100)' }, 'name 은 최대 100자로 제한해야 합니다.'),
      column('products', 'price', {}, 'products 에 price 컬럼이 필요합니다.'),
      column('products', 'stock', {}, 'products 에 stock 컬럼이 필요합니다.')
    ],
    // UNSIGNED 는 SQLite 로 옮길 때 사라지므로 정규식으로 확인한다
    keepStaticMessages: ['price 는 소수점 둘째 자리', 'stock 은 음수 범위']
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
      table('posts', 'posts 테이블을 만들어야 합니다.'),
      primaryKey('posts', ['post_id'], 'post_id 를 자동 증가하는 기본키로 정의해야 합니다.'),
      autoIncrement('posts', 'title', ["'a'", "'b'"], '새 글을 저장하면 post_id 가 1, 2, ... 로 자동 발급되어야 합니다.', 'post_id'),
      column('posts', 'title', { sqlType: 'VARCHAR(200)' }, 'title 은 최대 200자로 제한해야 합니다.')
    ]
  },
  'week-2-2-p2': {
    checks: [
      table('access_logs', 'access_logs 테이블을 만들어야 합니다.'),
      primaryKey('access_logs', ['log_id'], 'log_id 를 자동 증가하는 기본키로 정의해야 합니다.'),
      autoIncrement(
        'access_logs',
        'path, accessed_at',
        ["'/a', '2026-01-01 09:00:00'", "'/b', '2026-01-01 09:00:01'"],
        '새 로그를 저장하면 log_id 가 1, 2, ... 로 자동 발급되어야 합니다.',
        'log_id'
      ),
      column('access_logs', 'path', { sqlType: 'VARCHAR(255)' }, 'path 는 최대 255자로 제한해야 합니다.'),
      column('access_logs', 'accessed_at', {}, 'access_logs 에 accessed_at 컬럼이 필요합니다.')
    ],
    // AUTO_INCREMENT 컬럼은 SQLite 에서 INTEGER 로 바뀌므로 BIGINT 여부는 정규식으로 확인한다
    keepStaticMessages: ['log_id 는 수년간', 'accessed_at 은 날짜와 시각']
  },
  'week-2-2-p3': {
    checks: [
      table('orders', 'orders 테이블을 만들어야 합니다.'),
      primaryKey('orders', ['order_id'], 'order_id 를 자동 증가하는 기본키로 정의해야 합니다.'),
      autoIncrement(
        'orders',
        'ordered_at',
        ["'2026-01-01 09:00:00'", "'2026-01-01 09:00:01'"],
        '새 주문을 저장하면 order_id 가 1, 2, ... 로 자동 발급되어야 합니다.',
        'order_id'
      ),
      column('orders', 'ordered_at', {}, 'orders 에 ordered_at 컬럼이 필요합니다.')
    ],
    keepStaticMessages: ['ordered_at 은 날짜와 시각']
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
      table('posts', 'posts 테이블을 만들어야 합니다.'),
      primaryKey('posts', ['post_id'], 'post_id 를 자동 증가하는 기본키로 정의해야 합니다.'),
      column('posts', 'title', { sqlType: 'VARCHAR(200)', notNull: true }, '제목이 없는 글은 저장되지 않아야 합니다.'),
      column('posts', 'view_count', { defaultValue: '0' }, 'view_count 의 기본값을 0 으로 지정해야 합니다.'),
      column('posts', 'view_count', { notNull: true }, 'view_count 는 NULL 이 될 수 없어야 합니다.'),
      column('posts', 'created_at', { defaultValue: 'CURRENT_TIMESTAMP' }, 'created_at 은 저장 시점의 시각으로 채워져야 합니다.'),
      {
        type: 'query',
        setup: "INSERT INTO posts (title) VALUES ('첫 글')",
        sql: 'SELECT view_count, created_at IS NOT NULL FROM posts',
        expect: [[0, 1]],
        message: '제목만 넣고 저장하면 조회수는 0, 작성 시각은 자동으로 채워져야 합니다.'
      }
    ]
  },
  'week-2-3-p2': {
    checks: [
      table('products', 'products 테이블을 만들어야 합니다.'),
      primaryKey('products', ['product_id'], 'product_id 를 자동 증가하는 기본키로 정의해야 합니다.'),
      column('products', 'name', { sqlType: 'VARCHAR(100)', notNull: true }, 'name 은 필수이며 최대 100자여야 합니다.'),
      {
        type: 'rejects', constraint: 'CHECK',
        sql: "INSERT INTO products (name, price, stock, discount_rate) VALUES ('x', -1, 0, 0)",
        message: '가격이 음수인 상품은 저장되지 않아야 합니다.'
      },
      {
        type: 'rejects', constraint: 'CHECK',
        sql: "INSERT INTO products (name, price, stock, discount_rate) VALUES ('x', 1000, -1, 0)",
        message: '재고가 음수인 상품은 저장되지 않아야 합니다.'
      },
      {
        type: 'rejects', constraint: 'CHECK',
        sql: "INSERT INTO products (name, price, stock, discount_rate) VALUES ('x', 1000, 0, 150)",
        message: '할인율이 100 을 넘는 상품은 저장되지 않아야 합니다.'
      },
      {
        type: 'rejects', constraint: 'CHECK',
        sql: "INSERT INTO products (name, price, stock, discount_rate) VALUES ('x', 1000, 0, -1)",
        message: '할인율이 0 보다 작은 상품은 저장되지 않아야 합니다.'
      },
      {
        type: 'accepts',
        sql: "INSERT INTO products (name, price, stock, discount_rate) VALUES ('x', 0, 0, 0), ('y', 19.99, 10, 100)",
        message: '가격·재고가 0 이상이고 할인율이 0~100 이면 저장할 수 있어야 합니다.'
      }
    ]
  },
  'week-2-3-p3': {
    checks: [
      table('users', 'users 테이블을 만들어야 합니다.'),
      primaryKey('users', ['user_id'], 'user_id 를 자동 증가하는 기본키로 정의해야 합니다.'),
      {
        type: 'rejects', constraint: 'UNIQUE',
        setup: "INSERT INTO users (email) VALUES ('hong@example.com')",
        sql: "INSERT INTO users (email) VALUES ('hong@example.com')",
        message: '이미 가입된 이메일로는 다시 가입할 수 없어야 합니다.'
      },
      {
        type: 'accepts',
        setup: "INSERT INTO users (email) VALUES ('hong@example.com')",
        sql: "INSERT INTO users (email) VALUES ('kim@example.com')",
        message: '다른 이메일로는 가입할 수 있어야 합니다.'
      },
      column('users', 'email', { sqlType: 'VARCHAR(255)' }, 'email 은 최대 255자로 제한해야 합니다.'),
      column('users', 'status', { sqlType: 'VARCHAR(20)', defaultValue: 'active' }, "status 의 기본값을 'active' 로 지정해야 합니다."),
      {
        type: 'query',
        setup: "INSERT INTO users (email) VALUES ('hong@example.com')",
        sql: 'SELECT status FROM users',
        expect: [['active']],
        message: "status 를 주지 않고 가입하면 'active' 로 저장되어야 합니다."
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
      table('comments', 'comments 테이블을 만들어야 합니다.'),
      column('comments', 'post_id', { notNull: true }, '모든 댓글은 반드시 하나의 글에 속해야 합니다.'),
      foreignKey('comments', 'post_id', 'posts', 'CASCADE', '글이 삭제되면 댓글도 함께 삭제되어야 합니다.'),
      {
        type: 'query',
        setup:
          "INSERT INTO users (email, name) VALUES ('a@a.com', 'A'); " +
          "INSERT INTO posts (user_id, title) VALUES (1, 't'); " +
          "INSERT INTO comments (post_id, content) VALUES (1, 'c1'), (1, 'c2'); " +
          'DELETE FROM posts WHERE id = 1',
        sql: 'SELECT COUNT(*) FROM comments',
        expect: [[0]],
        message: '글을 삭제했는데 댓글이 남아 있습니다. 글과 함께 삭제되어야 합니다.'
      }
    ],
    // 외래키 이름과 TEXT 계열 타입은 엔진이 구분하지 못하므로 정규식으로 확인한다
    keepStaticMessages: ['fk_comments_post 라는 이름', 'content 는 필수인 긴 글']
  },
  'week-2-4-p2': {
    checks: [
      table('posts_archive', 'posts_archive 테이블을 만들어야 합니다.'),
      column('posts_archive', 'user_id', { notNull: false }, 'user_id 는 비워질 수 있어야 합니다.'),
      column('posts_archive', 'title', { sqlType: 'VARCHAR(255)', notNull: true }, 'title 은 필수이며 최대 255자여야 합니다.'),
      foreignKey('posts_archive', 'user_id', 'users', 'SET NULL', '작성자가 삭제되면 user_id 만 비워지도록 외래키를 정의해야 합니다.'),
      {
        type: 'query',
        setup:
          "INSERT INTO users (email, name) VALUES ('a@a.com', 'A'); " +
          "INSERT INTO posts_archive (user_id, title) VALUES (1, '채택된 답변'); " +
          'DELETE FROM users WHERE id = 1',
        sql: 'SELECT title, user_id FROM posts_archive',
        expect: [['채택된 답변', null]],
        message: '작성자를 삭제해도 글은 남고 user_id 만 NULL 이 되어야 합니다.'
      }
    ]
  },
  'week-2-4-p3': {
    checks: [
      table('orders', 'orders 테이블을 만들어야 합니다.'),
      table('order_items', 'order_items 테이블을 만들어야 합니다.'),
      column('orders', 'user_id', { notNull: true }, 'orders.user_id 는 반드시 값이 있어야 합니다.'),
      foreignKey('orders', 'user_id', 'users', undefined, 'orders.user_id 는 users(id) 를 참조해야 합니다.'),
      {
        type: 'rejects', constraint: 'FOREIGN KEY',
        setup:
          "INSERT INTO users (email, name) VALUES ('a@a.com', 'A'); " +
          "INSERT INTO orders (user_id, ordered_at) VALUES (1, '2026-01-01 09:00:00')",
        sql: 'DELETE FROM users WHERE id = 1',
        message: '주문이 있는 회원은 삭제가 거부되어야 합니다.'
      },
      column('order_items', 'order_id', { notNull: true }, 'order_items.order_id 는 반드시 값이 있어야 합니다.'),
      foreignKey('order_items', 'order_id', 'orders', 'CASCADE', '주문이 삭제되면 주문 항목도 함께 삭제되어야 합니다.'),
      {
        type: 'query',
        setup:
          "INSERT INTO users (email, name) VALUES ('a@a.com', 'A'); " +
          "INSERT INTO orders (user_id, ordered_at) VALUES (1, '2026-01-01 09:00:00'); " +
          "INSERT INTO order_items (order_id, product_name, quantity) VALUES (1, '키보드', 1), (1, '마우스', 2); " +
          'DELETE FROM orders WHERE id = 1',
        sql: 'SELECT COUNT(*) FROM order_items',
        expect: [[0]],
        message: '주문을 삭제했는데 주문 항목이 남아 있습니다. 함께 삭제되어야 합니다.'
      }
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
      table('students', 'students 테이블을 만들어야 합니다.'),
      table('courses', 'courses 테이블을 만들어야 합니다.'),
      table('enrollments', 'enrollments 테이블을 만들어야 합니다.'),
      foreignKey('enrollments', 'student_id', 'students', 'CASCADE', 'student_id 는 students(id) 를 참조하고 함께 삭제되어야 합니다.'),
      foreignKey('enrollments', 'course_id', 'courses', 'CASCADE', 'course_id 는 courses(id) 를 참조하고 함께 삭제되어야 합니다.'),
      {
        type: 'rejects', constraint: 'UNIQUE',
        setup:
          "INSERT INTO students (name) VALUES ('홍길동'); INSERT INTO courses (title) VALUES ('SQL 기초'); " +
          'INSERT INTO enrollments (student_id, course_id) VALUES (1, 1)',
        sql: 'INSERT INTO enrollments (student_id, course_id) VALUES (1, 1)',
        message: '같은 학생이 같은 강의를 두 번 신청할 수 없어야 합니다.'
      }
    ],
    // 두 컬럼 순서를 어느 쪽으로 써도 되도록 복합 기본키 선언은 정규식으로 확인한다
    keepStaticMessages: ['enrollments 는 두 컬럼의 조합']
  },
  'week-2-5-p2': {
    checks: [
      column('enrollments', 'enrolled_at', { defaultValue: 'CURRENT_TIMESTAMP' }, 'enrollments 에 저장 시점으로 채워지는 enrolled_at 이 필요합니다.'),
      column('enrollments', 'grade', { notNull: false }, '성적이 나오기 전에는 grade 가 비어 있을 수 있어야 합니다.'),
      primaryKey('enrollments', ['student_id', 'course_id'], 'enrollments 의 복합 기본키는 유지해야 합니다.'),
      {
        type: 'query',
        setup:
          "INSERT INTO students (name) VALUES ('홍길동'); INSERT INTO courses (title) VALUES ('SQL 기초'); " +
          'INSERT INTO enrollments (student_id, course_id) VALUES (1, 1)',
        sql: 'SELECT enrolled_at IS NOT NULL, grade FROM enrollments',
        expect: [[1, null]],
        message: '수강 신청만 하면 신청 일시는 자동으로 채워지고 성적은 비어 있어야 합니다.'
      }
    ],
    keepStaticMessages: ['enrollments 에 비어 있을 수 있는 최대 2자 grade']
  },
  'week-2-5-p3': {
    checks: [
      table('post_likes', 'post_likes 테이블을 만들어야 합니다.'),
      foreignKey('post_likes', 'user_id', 'users', 'CASCADE', 'user_id 는 users(id) 를 참조하고 함께 삭제되어야 합니다.'),
      foreignKey('post_likes', 'post_id', 'posts', 'CASCADE', 'post_id 는 posts(id) 를 참조하고 함께 삭제되어야 합니다.'),
      column('post_likes', 'created_at', { defaultValue: 'CURRENT_TIMESTAMP' }, 'created_at 은 저장 시점의 시각으로 채워져야 합니다.'),
      {
        type: 'rejects', constraint: 'UNIQUE',
        setup:
          "INSERT INTO users (email, name) VALUES ('a@a.com', 'A'); INSERT INTO posts (user_id, title) VALUES (1, 't'); " +
          'INSERT INTO post_likes (user_id, post_id) VALUES (1, 1)',
        sql: 'INSERT INTO post_likes (user_id, post_id) VALUES (1, 1)',
        message: '같은 사용자가 같은 글에 좋아요를 두 번 저장할 수 없어야 합니다.'
      }
    ],
    keepStaticMessages: ['같은 사용자가 같은 글에 두 번 저장할 수 없도록 기본키']
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
          ['SQL one', 'Cooking', 'SQL two', 'Travel', 'SQL three', 'SQL four', 'Gaming', 'SQL five', 'SQL six', 'SQL seven']
            .map((title) => `INSERT INTO posts (user_id, title) VALUES (1, '${title}');`)
            .join(' '),
        expect: {
          column: { name: 'id', values: [10, 9, 8, 6, 5], ordered: true },
          rows: [[10, 'SQL seven'], [9, 'SQL six'], [8, 'SQL five'], [6, 'SQL four'], [5, 'SQL three']]
        },
        message: '제목에 SQL 이 포함된 글 중 최신 5개의 id 와 title 을 최신순으로 조회해야 합니다.'
      }
    ]
  },
  'week-2-6-p2': {
    checks: [
      {
        type: 'learnerSelect',
        fixture:
          `${USER_FIXTURE(['Alice', 'Bob', 'Carol'])} ` +
          "INSERT INTO posts (user_id, title) VALUES (1, 'a'), (1, 'b'), (1, 'c'), (2, 'd'), (2, 'e'), " +
          "(3, 'f'), (3, 'g'), (3, 'h'), (3, 'i');",
        expect: { rows: [['Carol', 4], ['Alice', 3]] },
        message: '글을 3개 이상 쓴 사용자의 이름과 글 수만 조회해야 합니다.'
      },
      {
        type: 'learnerSelect',
        fixture:
          `${USER_FIXTURE(['Alice', 'Bob', 'Carol'])} ` +
          "INSERT INTO posts (user_id, title) VALUES (1, 'a'), (1, 'b'), (1, 'c'), (2, 'd'), (2, 'e'), " +
          "(3, 'f'), (3, 'g'), (3, 'h'), (3, 'i');",
        expect: { column: { name: 'post_count', values: [4, 3], ordered: true } },
        message: '글 수를 post_count 라는 이름으로 보여 주고, 글 수가 많은 순서로 정렬해야 합니다.'
      }
    ]
  },
  'week-2-6-p3': {
    checks: [
      {
        type: 'learnerSelect',
        fixture: `${USER_FIXTURE(['Alice', 'Bob', 'Carol'])} INSERT INTO posts (user_id, title) VALUES (1, 'a');`,
        expect: { rows: [['Bob', 'bob2@example.com'], ['Carol', 'carol3@example.com']] },
        message: '글을 한 개도 쓰지 않은 회원의 이름과 이메일만 조회해야 합니다.'
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
        sql: "INSERT INTO posts (user_id, title, status) VALUES (1, 't', 'Published')",
        message: "status 에 'draft', 'published', 'hidden' 외의 값은 저장되지 않아야 합니다."
      },
      {
        type: 'accepts',
        foreignKeys: false,
        sql: "INSERT INTO posts (user_id, title, status) VALUES (1, 'a', 'draft'), (1, 'b', 'published'), (1, 'c', 'hidden')",
        message: "status 가 'draft', 'published', 'hidden' 이면 저장할 수 있어야 합니다."
      },
      column('posts', 'status', { notNull: true, defaultValue: 'draft' }, "status 의 NOT NULL 과 기본값 'draft' 를 유지해야 합니다.")
    ]
  },
  'week-2-final-p2': {
    prelude: BLOG_SCHEMA,
    checks: [
      {
        type: 'rejects',
        constraint: 'CHECK',
        sql: "INSERT INTO users (email, name, role) VALUES ('a@a.com', 'A', 'superuser')",
        message: "role 에 'user', 'admin' 외의 값은 저장되지 않아야 합니다."
      },
      {
        type: 'accepts',
        sql: "INSERT INTO users (email, name, role) VALUES ('a@a.com', 'A', 'admin'), ('b@b.com', 'B', 'user')",
        message: "role 이 'user' 또는 'admin' 이면 저장할 수 있어야 합니다."
      },
      {
        type: 'index',
        table: 'posts',
        columns: ['user_id', 'created_at'],
        message: '"내 글" 목록 조회에 맞게 posts 의 (user_id, created_at) 순서로 복합 인덱스를 만들어야 합니다.'
      }
    ],
    keepStaticMessages: ['"내 글" 목록 조회에 맞는 복합 인덱스 idx_posts_user_created']
  },
  'week-2-final-p3': {
    prelude: BLOG_SCHEMA,
    checks: [
      {
        type: 'learnerSelect',
        fixture:
          "INSERT INTO users (email, name) VALUES ('a@a.com', 'Alice'), ('b@b.com', 'Bob'); " +
          "INSERT INTO posts (user_id, title, created_at) VALUES (1, 'P1', '2026-01-01 09:00:00'), " +
          "(1, 'P2', '2026-01-02 09:00:00'), (2, 'P3', '2026-01-03 09:00:00'); " +
          "INSERT INTO tags (name) VALUES ('sql'), ('js'); " +
          'INSERT INTO post_tags (post_id, tag_id) VALUES (1, 1), (2, 2), (3, 1);',
        expect: { rows: [['P3', 'Bob', '2026-01-03 09:00:00'], ['P1', 'Alice', '2026-01-01 09:00:00']] },
        message: "'sql' 태그가 붙은 글의 제목, 작성자 이름, 작성 시각을 조회해야 합니다."
      }
    ],
    // 결과 비교는 행 순서를 보지 않으므로 최신순 정렬은 정규식으로 확인한다
    keepStaticMessages: ['최신 글이 먼저 오도록 정렬']
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
