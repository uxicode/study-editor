import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { CURRICULUM_STEPS } from '@/data/curriculum-steps'
import { useValidator } from '@/composables/use-validator'
import { splitSqlStatements, translateStatement } from '@/lib/sql-engine/translate'

/**
 * SQL 실행 기반 채점이 정규식 채점의 두 약점을 고쳤는지 확인한다.
 *  - 정답을 다르게 써도 통과해야 한다
 *  - 키워드만 흉내 낸 오답은 걸러져야 한다
 */

const { validateStep } = useValidator()

async function grade(stepId: string, contents: Record<string, string>): Promise<string[]> {
  const step = CURRICULUM_STEPS.find((s) => s.id === stepId)
  if (!step) throw new Error(`스텝을 찾을 수 없습니다: ${stepId}`)

  const files = step.initialFiles.map((f) => ({
    name: f.name,
    path: f.path,
    content: contents[f.path] ?? f.content,
    readonly: f.readonly
  }))
  const result = await validateStep(step, files, { success: true, output: '', logs: ['Mock Runtime'] })
  return result.errors.map((e) => e.message)
}

describe('SQL 채점', () => {
  beforeAll(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
  })
  afterAll(() => {
    vi.restoreAllMocks()
  })

  describe('다르게 쓴 정답도 통과한다', () => {
    it('AUTO_INCREMENT 와 PRIMARY KEY 의 순서가 바뀌어도 통과', async () => {
      const errors = await grade('week-2-2', {
        'schema.sql': 'create table users (\n  id int primary key auto_increment,\n  email varchar(255),\n  name varchar(100)\n);'
      })
      expect(errors).toEqual([])
    })

    it('테이블 수준 PRIMARY KEY (id) 로 써도 통과', async () => {
      const errors = await grade('week-2-2', {
        'schema.sql': 'CREATE TABLE users (id INT AUTO_INCREMENT, email VARCHAR(255), name VARCHAR(100), PRIMARY KEY (id));'
      })
      expect(errors).toEqual([])
    })

    it('외래키를 컬럼 정의 뒤 별도 CONSTRAINT 로 선언해도 통과', async () => {
      const errors = await grade('week-2-4', {
        'schema.sql': `CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255) NOT NULL UNIQUE, name VARCHAR(100) NOT NULL);
CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  user_id INT NOT NULL,
  CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
      })
      expect(errors).toEqual([])
    })

    it('SELECT 컬럼 순서·별칭·추가 컬럼이 달라도 통과', async () => {
      const errors = await grade('week-2-final-p3', {
        'schema.sql': `-- 글과 태그는 N:M 이라 post_tags 를 거쳐야 합니다.
SELECT u.id, u.name AS author, p.title AS subject, p.created_at
FROM tags t
JOIN post_tags pt ON pt.tag_id = t.id
JOIN posts p ON p.id = pt.post_id
JOIN users u ON u.id = p.user_id
WHERE t.name = 'sql'
ORDER BY p.created_at DESC;`
      })
      expect(errors).toEqual([])
    })

    it('LEFT JOIN 대신 서브쿼리로 풀어도 통과 (글 없는 사용자)', async () => {
      const errors = await grade('week-2-6-p3', {
        'queries.sql': `-- INNER JOIN 은 짝이 있는 행만 남겨서 글 없는 회원이 빠집니다.
SELECT email, name FROM users WHERE id NOT IN (SELECT user_id FROM posts);`
      })
      expect(errors).toEqual([])
    })

    it('컬럼 이름을 문항대로 쓰면 통과 (post_id · body 를 쓰는 블로그 글 테이블)', async () => {
      const errors = await grade('week-2-1-p1', {
        'schema.sql': `-- title 은 짧은 값이라 VARCHAR(200), body 는 긴 글이라 TEXT 를 골랐습니다.
CREATE TABLE posts (
    post_id INT,
    title VARCHAR(200),
    body TEXT,
    published_at DATETIME
);`
      })
      expect(errors).toEqual([])
    })

    it('테이블 수준 UNIQUE (email) 로 써도 통과', async () => {
      const errors = await grade('week-2-3-p3', {
        'schema.sql': `-- 탈퇴 회원의 행이 남아 있어 재가입이 막힙니다. UNIQUE 는 NULL 끼리는 같다고 보지 않습니다.
CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  email   VARCHAR(255) NOT NULL,
  status  VARCHAR(20)  NOT NULL DEFAULT 'active',
  UNIQUE (email)
);`
      })
      expect(errors).toEqual([])
    })
  })

  describe('틀린 답은 걸러낸다', () => {
    it('문법 오류는 어느 구문인지 알려준다', async () => {
      const errors = await grade('week-2-1', { 'schema.sql': 'CREATE TABL users (id INT);' })
      expect(errors).toHaveLength(1)
      expect(errors[0]).toContain('schema.sql 의 1번째 구문')
    })

    it('주석에 키워드만 적고 실제 제약은 없으면 실패 (정규식은 속았던 케이스)', async () => {
      const errors = await grade('week-2-3', {
        'schema.sql': `-- UNIQUE NOT NULL CHECK (age >= 0) DEFAULT 'user'
CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255), name VARCHAR(100), role VARCHAR(20), age INT);`
      })
      expect(errors).toEqual(
        expect.arrayContaining([
          'email 컬럼에 NOT NULL 이 필요합니다.',
          'email 컬럼에 UNIQUE 제약이 필요합니다.',
          'age 컬럼에 CHECK (age >= 0) 제약이 필요합니다.'
        ])
      )
    })

    it('주석에만 UNIQUE 를 적고 email 에 제약이 없으면 중복 가입이 허용되어 실패', async () => {
      const errors = await grade('week-2-3-p3', {
        'schema.sql': `-- 탈퇴 후 재가입 문제, UNIQUE 와 NULL
CREATE TABLE users (user_id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255), status VARCHAR(20) DEFAULT 'active');`
      })
      expect(errors).toEqual(['이미 가입된 이메일로는 다시 가입할 수 없어야 합니다.'])
    })

    it('대용량 로그의 log_id 를 INT 로 두면 실패', async () => {
      const errors = await grade('week-2-2-p2', {
        'schema.sql': `-- INT 는 21억이 최댓값입니다.
CREATE TABLE access_logs (log_id INT AUTO_INCREMENT PRIMARY KEY, path VARCHAR(255), accessed_at DATETIME);`
      })
      expect(errors).toEqual(['log_id 는 수년간 번호가 부족하지 않은 타입이어야 합니다.'])
    })

    it('주문이 있는 회원을 지울 수 있게 CASCADE 로 걸면 실패', async () => {
      const step = CURRICULUM_STEPS.find((s) => s.id === 'week-2-4-p3')
      const given = step?.initialFiles[0].content ?? ''
      const errors = await grade('week-2-4-p3', {
        'schema.sql': `${given}
-- RESTRICT 대신 CASCADE, 주문 항목은 CASCADE
CREATE TABLE orders (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, ordered_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE);
CREATE TABLE order_items (id INT AUTO_INCREMENT PRIMARY KEY, order_id INT NOT NULL, product_name VARCHAR(100), quantity INT,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE);`
      })
      expect(errors).toContain('주문이 있는 회원은 삭제가 거부되어야 합니다.')
    })

    it('ON DELETE CASCADE 가 빠진 외래키는 실패', async () => {
      const errors = await grade('week-2-4', {
        'schema.sql': `CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255) NOT NULL UNIQUE, name VARCHAR(100) NOT NULL);
CREATE TABLE posts (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, title VARCHAR(255) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id));`
      })
      expect(errors.some((m) => m.includes('ON DELETE CASCADE'))).toBe(true)
    })

    it('HAVING 기준을 틀리면 (>= 2) 실패', async () => {
      const errors = await grade('week-2-6-p2', {
        'queries.sql': `-- HAVING 은 집계 후에 거릅니다.
SELECT u.name, COUNT(p.id) AS post_count FROM users u JOIN posts p ON p.user_id = u.id
GROUP BY u.id, u.name HAVING COUNT(p.id) >= 2 ORDER BY post_count DESC;`
      })
      expect(errors).toContain('글을 3개 이상 쓴 사용자의 이름과 글 수만 조회해야 합니다.')
    })

    it('INNER JOIN 으로 풀면 글 없는 사용자가 빠져 실패', async () => {
      const errors = await grade('week-2-6', {
        'queries.sql': `INSERT INTO users (email, name) VALUES ('a@a.com', 'A'), ('b@b.com', 'B');
INSERT INTO posts (user_id, title) VALUES (1, 't');
SELECT id, title FROM posts ORDER BY id DESC LIMIT 10;
SELECT p.title, u.name FROM posts p INNER JOIN users u ON u.id = p.user_id;
SELECT u.name, COUNT(p.id) FROM users u INNER JOIN posts p ON p.user_id = u.id GROUP BY u.id;`
      })
      expect(errors).toEqual(['사용자별 글 수를 세는 LEFT JOIN + GROUP BY 쿼리가 필요합니다 (글이 없는 사용자는 0 으로 나와야 합니다).'])
    })

    it('LIMIT 없이 정렬만 하면 실패', async () => {
      const errors = await grade('week-2-6-p1', {
        'queries.sql': `-- 2페이지는 OFFSET 5 를 붙입니다.
SELECT id, title FROM posts WHERE title LIKE '%SQL%' ORDER BY id DESC;`
      })
      expect(errors).toHaveLength(1)
    })

    it('존재하지 않는 테이블을 가리키는 쿼리는 실행 오류로 실패', async () => {
      const errors = await grade('week-2-6-p3', { 'queries.sql': 'SELECT name FROM members;' })
      expect(errors[0]).toContain('queries.sql 의 1번째 구문')
    })

    it('인덱스를 만들지 않으면 EXPLAIN 이 SEARCH 로 바뀌지 않아 실패', async () => {
      const errors = await grade('week-4-5-p3', {
        'schema.sql': 'EXPLAIN SELECT * FROM posts WHERE user_id = 1 ORDER BY created_at DESC LIMIT 10;\n-- rows 감소 예상'
      })
      expect(errors.some((m) => m.includes('CREATE INDEX'))).toBe(true)
    })
  })
})

describe('MySQL → SQLite 변환', () => {
  it('문자열·주석 안의 세미콜론으로 구문을 나누지 않는다', () => {
    const statements = splitSqlStatements(`-- a; b
INSERT INTO t (v) VALUES ('x;y'); /* c; d */ SELECT 1;`)
    expect(statements).toEqual(["INSERT INTO t (v) VALUES ('x;y')", 'SELECT 1'])
  })

  it('AUTO_INCREMENT 를 INTEGER PRIMARY KEY AUTOINCREMENT 로 바꾼다', () => {
    const [sql] = translateStatement('CREATE TABLE t (id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY)')
    expect(sql).toContain('id INTEGER NOT NULL')
    expect(sql).toContain('PRIMARY KEY AUTOINCREMENT')
    expect(sql).not.toContain('AUTO_INCREMENT')
  })

  it('인라인 KEY 는 별도 CREATE INDEX 로 분리하고 ENGINE 옵션은 제거한다', () => {
    const statements = translateStatement(
      'CREATE TABLE t (id INT PRIMARY KEY, a INT, KEY idx_a (a)) ENGINE=InnoDB'
    )
    expect(statements).toHaveLength(2)
    expect(statements[0]).not.toContain('ENGINE')
    expect(statements[1]).toBe('CREATE INDEX idx_a ON t (a)')
  })

  it('EXPLAIN 을 EXPLAIN QUERY PLAN 으로 바꾼다', () => {
    expect(translateStatement('EXPLAIN SELECT * FROM t')).toEqual(['EXPLAIN QUERY PLAN SELECT * FROM t'])
  })
})
