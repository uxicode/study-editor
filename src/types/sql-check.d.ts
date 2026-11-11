/** SQLite 가 돌려주는 셀 값 (바이너리는 학습 범위 밖이라 제외) */
export type SqlValue = string | number | null

/**
 * 학습자의 SQL 을 실제 엔진에서 실행한 뒤 수행하는 선언형 검사.
 * 모든 검사는 `message` 를 실패 시 학습자에게 보여준다.
 */
export type SqlCheck =
  | SqlTableCheck
  | SqlColumnCheck
  | SqlPrimaryKeyCheck
  | SqlForeignKeyCheck
  | SqlIndexCheck
  | SqlAcceptsCheck
  | SqlRejectsCheck
  | SqlQueryCheck
  | SqlLearnerSelectCheck

interface SqlCheckBase {
  message: string
}

export interface SqlTableCheck extends SqlCheckBase {
  type: 'table'
  table: string
}

export interface SqlColumnCheck extends SqlCheckBase {
  type: 'column'
  table: string
  column: string
  /** 선언 타입 (공백 제거·대문자 비교, INTEGER 는 INT 와 동일 취급). 예: 'VARCHAR(255)' */
  sqlType?: string
  /** true: NOT NULL (기본키 포함), false: NULL 허용 */
  notNull?: boolean
  /** DEFAULT 값 (따옴표 제거 후 대소문자 무시 비교). 예: 'user', '0', 'CURRENT_TIMESTAMP' */
  defaultValue?: string
}

export interface SqlPrimaryKeyCheck extends SqlCheckBase {
  type: 'primaryKey'
  table: string
  /** 순서대로 비교한다 */
  columns: string[]
}

export interface SqlForeignKeyCheck extends SqlCheckBase {
  type: 'foreignKey'
  table: string
  column: string
  refTable: string
  refColumn: string
  onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION'
}

export interface SqlIndexCheck extends SqlCheckBase {
  type: 'index'
  table: string
  /** 순서대로 비교한다 (UNIQUE 제약이 만드는 자동 인덱스 포함) */
  columns: string[]
  unique?: boolean
}

interface SqlStatementCheckBase extends SqlCheckBase {
  /** 먼저 실행할 준비 SQL (실패하면 검사 실패) */
  setup?: string
  sql: string
  /** false 면 이 검사 동안 외래키 검사를 끈다 (부모 행 없이 컬럼 제약만 시험할 때) */
  foreignKeys?: boolean
}

/** 학습자 스키마 위에서 `sql` 이 오류 없이 실행되어야 한다 */
export interface SqlAcceptsCheck extends SqlStatementCheckBase {
  type: 'accepts'
}

/** 학습자 스키마 위에서 `sql` 이 지정한 제약조건 위반으로 실패해야 한다 */
export interface SqlRejectsCheck extends SqlStatementCheckBase {
  type: 'rejects'
  /** 위반되어야 하는 제약 종류. 다른 오류(테이블 없음 등)는 거부로 인정하지 않는다 */
  constraint: 'CHECK' | 'UNIQUE' | 'NOT NULL' | 'FOREIGN KEY' | 'PRIMARY KEY'
}

/** `sql` 의 마지막 결과가 기대와 일치해야 한다 */
export interface SqlQueryCheck extends SqlCheckBase {
  type: 'query'
  setup?: string
  sql: string
  /** 결과 행 전체 (순서 포함) */
  expect?: SqlValue[][]
  /** 결과 어느 셀에든 포함되어야 하는 문자열 (대소문자 무시) */
  contains?: string
}

/**
 * 학습자가 작성한 SELECT/EXPLAIN 문 중 하나라도 조건을 만족해야 한다.
 * 학습자의 DDL 과 `fixture` 로 만든 깨끗한 DB 에서 실행하므로, 학습자가 직접 넣은 데이터와 무관하다.
 */
export interface SqlLearnerSelectCheck extends SqlCheckBase {
  type: 'learnerSelect'
  /** DDL 실행 후 채워 넣을 고정 데이터 */
  fixture?: string
  expect: {
    /** 결과 행 개수 */
    rowCount?: number
    /** 이 컬럼의 값들 (컬럼명 대소문자 무시) */
    column?: { name: string; values: SqlValue[]; ordered?: boolean }
    /** 기대 행들. 행 순서·컬럼 순서·추가 컬럼은 무시하고, 행 개수는 같아야 한다 */
    rows?: SqlValue[][]
    /** 결과 어느 셀에든 포함되어야 하는 문자열 (대소문자 무시) */
    contains?: string
  }
}

/** 스텝별 SQL 채점 설정 */
export interface StepSqlSpec {
  /**
   * 학습자 파일보다 먼저 실행할 숨은 스키마 (스텝에 테이블이 없는 EXPLAIN 실습 등).
   * 학습자 파일이 직접 정의한 테이블은 이 스키마에서 빠지고, 정의하지 않은 테이블만 채워진다.
   */
  prelude?: string
  checks: SqlCheck[]
  /**
   * 엔진 검사가 대체하는 정적(정규식) 검사 중 그대로 유지할 것의 메시지 접두사.
   * ('주석' 요구 검사는 항상 유지된다)
   */
  keepStaticMessages?: string[]
}
