import type { CurriculumStep } from '@/types/curriculum'

export const week_2_1: CurriculumStep = {
  id: 'week-2-1',
  title: '1주차 · CREATE TABLE 기본',
  order: 1,
  category: 'schema',
  content: {
    mission:
      '`schema.sql` 에 `users` 테이블을 생성하는 `CREATE TABLE` 문을 작성하세요. 컬럼은 `id INT`, `email VARCHAR(255)`, `name VARCHAR(100)` 3개로 시작합니다.',
    theory: `
      ## 먼저, 테이블과 컬럼이 뭔가요?

      데이터베이스(DB)는 **엑셀 파일**과 비슷하게 생각하면 쉽습니다.

      | 엑셀         | 데이터베이스      | 예시                        |
      |--------------|-------------------|-----------------------------|
      | 시트         | **테이블(table)** | \`users\` (사용자 목록)       |
      | 열(세로 칸)  | **컬럼(column)**  | \`id\`, \`email\`, \`name\`     |
      | 행(가로 줄)  | **행(row)**       | 사용자 한 명의 정보         |

      \`CREATE TABLE\` 은 "이런 열들을 가진 새 시트를 만들어라" 라는 명령입니다.

      ## 왜 컬럼마다 '타입'을 정해야 하나요?

      엑셀은 한 칸에 숫자든 글자든 아무거나 넣을 수 있지만, DB 는 컬럼마다 **어떤 종류의 값만 넣을 수 있는지** 미리 약속합니다.

      - 나이 칸에 \`'안녕하세요'\` 같은 엉뚱한 값이 들어오는 것을 막아 줍니다.
      - 숫자는 숫자답게(더하기·크기 비교), 날짜는 날짜답게(기간 계산) 정확하게 다룰 수 있습니다.
      - 값마다 필요한 저장 공간이 달라서, 알맞은 타입을 쓰면 공간과 속도를 아낄 수 있습니다.

      이 약속을 **데이터 타입(data type)** 이라고 합니다.

      ## CREATE TABLE 기본 형식

      \`\`\`sql
      CREATE TABLE users (
        id    INT,
        email VARCHAR(255),
        name  VARCHAR(100)
      );
      \`\`\`

      - 테이블 이름은 영어 소문자 + 복수형 (\`users\`, \`posts\`, \`comments\`) 이 흔합니다.
      - 컬럼 정의는 \`이름 타입 [제약조건]\` 순서로 적습니다.
      - 컬럼 사이는 쉼표(,)로 구분하고, 마지막 컬럼 뒤에는 쉼표를 붙이지 않습니다.
      - 문장의 끝에는 세미콜론(;)을 붙입니다.

      ## MySQL 타입 한눈에 보기

      | 분류        | 타입                                              | 쓰임                 |
      |-------------|---------------------------------------------------|----------------------|
      | 정수        | \`TINYINT\` \`SMALLINT\` \`MEDIUMINT\` \`INT\` \`BIGINT\` | 나이, 개수, id       |
      | 소수        | \`DECIMAL(M,D)\` \`FLOAT\` \`DOUBLE\`                 | 가격, 비율, 좌표     |
      | 문자열      | \`CHAR(n)\` \`VARCHAR(n)\` \`TEXT\` (\`MEDIUMTEXT\` \`LONGTEXT\`) | 이름, 이메일, 본문 |
      | 날짜 / 시간 | \`DATE\` \`TIME\` \`DATETIME\` \`TIMESTAMP\` \`YEAR\`   | 생년월일, 가입 시각  |
      | 참 / 거짓   | \`BOOLEAN\` (= \`TINYINT(1)\`)                      | 공개 여부, 탈퇴 여부 |

      이 밖에 \`ENUM\`(정해진 목록 중 하나), \`JSON\`, \`BLOB\`(파일 같은 이진 데이터) 도 있지만 지금은 몰라도 됩니다.

      ## 정수 타입: 크기마다 담을 수 있는 범위가 다릅니다

      정수 타입은 이름이 다른 만큼 **차지하는 저장 공간(바이트)** 과 **담을 수 있는 숫자 범위**가 다릅니다.
      (1바이트는 컴퓨터가 쓰는 가장 작은 저장 단위 중 하나로, 1바이트로 256가지 값을 표현할 수 있습니다.)

      | 타입        | 크기   | 기본(음수 가능) 범위                                    | UNSIGNED(0 이상만) 범위                |
      |-------------|--------|---------------------------------------------------------|----------------------------------------|
      | \`TINYINT\`   | 1바이트 | -128 ~ 127                                              | 0 ~ 255                                |
      | \`SMALLINT\`  | 2바이트 | -32,768 ~ 32,767                                        | 0 ~ 65,535                             |
      | \`MEDIUMINT\` | 3바이트 | -8,388,608 ~ 8,388,607                                  | 0 ~ 16,777,215                         |
      | \`INT\`       | 4바이트 | -2,147,483,648 ~ 2,147,483,647 (약 ±21억)               | 0 ~ 4,294,967,295 (약 42억)            |
      | \`BIGINT\`    | 8바이트 | 약 -922경 ~ 922경 (-9,223,372,036,854,775,808 ~ 9,223,372,036,854,775,807) | 0 ~ 약 1,844경 |

      - **UNSIGNED** 는 "음수를 포기하는 대신 양수 범위를 두 배로" 쓰겠다는 옵션입니다. 나이나 개수처럼 음수가 없는 값에 어울립니다. 예: \`age TINYINT UNSIGNED\`
      - **범위를 넘는 값을 넣으면 에러**가 납니다. (MySQL 기본 설정 기준) 값이 조용히 잘려서 저장되지 않습니다.

      \`\`\`sql
      CREATE TABLE demo (age TINYINT UNSIGNED);

      INSERT INTO demo (age) VALUES (200);  -- OK
      INSERT INTO demo (age) VALUES (300);  -- ERROR 1264: Out of range value for column 'age'
      \`\`\`

      ### 그럼 id 에는 뭘 쓰나요?

      - 대부분의 서비스는 \`INT\` 로 충분합니다. 약 21억 건까지 담을 수 있고, 하루에 100만 건씩 쌓여도 5년 넘게 걸립니다.
      - 로그, 결제 내역처럼 **수십억 건 이상** 쌓일 수 있다면 처음부터 \`BIGINT\` 를 씁니다. 나중에 INT 가 꽉 차서 타입을 바꾸는 일은 매우 고통스럽기 때문입니다.
      - 이 커리큘럼은 학습 단순화를 위해 \`INT\` 를 사용합니다.

      > 참고: \`INT(11)\` 처럼 괄호 안에 숫자를 적은 코드를 가끔 보지만, 이 숫자는 **저장 크기나 범위를 바꾸지 않습니다.** MySQL 8.0 부터는 사용을 권장하지 않으므로 그냥 \`INT\` 라고 쓰세요.

      ## 소수 타입: 돈에는 DECIMAL 을 쓰세요

      | 타입              | 특징                                                              |
      |-------------------|-------------------------------------------------------------------|
      | \`DECIMAL(M,D)\`    | **정확한** 소수. M = 전체 자릿수, D = 소수점 이하 자릿수 (예: 가격) |
      | \`FLOAT\` \`DOUBLE\`  | 아주 넓은 범위를 담지만 **근사값**이라 미세한 오차가 생길 수 있음 |

      - \`DECIMAL(10,2)\` 는 "전체 10자리, 그중 소수점 아래 2자리" 라는 뜻이라 \`-99,999,999.99\` ~ \`99,999,999.99\` 까지 담습니다. (정수부 8자리 + 소수부 2자리)
      - 컴퓨터는 \`0.1 + 0.2\` 를 정확히 \`0.3\` 으로 저장하지 못하는 경우가 있습니다(FLOAT/DOUBLE 방식). 그래서 금액처럼 틀리면 안 되는 값은 **반드시 DECIMAL** 을 씁니다.

      ## 문자열 타입

      ### VARCHAR(n): 가장 많이 쓰는 문자열 타입

      - \`n\` 은 **최대 글자 수**입니다. 바이트 수가 아닙니다. (MySQL 5.0.3 이상)
      - 영어, 한글, 이모지 모두 **1글자 = 1** 로 셉니다. \`VARCHAR(5)\` 에는 \`'hello'\` 도, \`'안녕하세요'\` 도 들어갑니다.
      - **가변 길이**라서, \`VARCHAR(255)\` 에 \`'abc'\` 를 저장해도 255칸을 차지하지 않고 실제 글자 수만큼만 씁니다.
      - 정한 길이를 넘기면 에러가 납니다. (MySQL 기본 설정 기준)

      \`\`\`sql
      CREATE TABLE demo (code VARCHAR(5));

      INSERT INTO demo (code) VALUES ('안녕하세요');   -- OK (5글자)
      INSERT INTO demo (code) VALUES ('안녕하세요!');  -- ERROR 1406: Data too long for column 'code'
      \`\`\`

      - 문자열 값은 반드시 **작은따옴표(')** 로 감쌉니다. 숫자는 감싸지 않습니다.
      - 길이를 생략한 \`VARCHAR\` 는 문법 에러입니다. 꼭 \`VARCHAR(100)\` 처럼 적으세요.
      - "그럼 넉넉하게 아주 크게 잡으면 되지 않나요?" → 한 행이 가질 수 있는 총 크기에 한도(약 65,535바이트)가 있고, 글자당 최대 4바이트(utf8mb4)가 필요할 수 있어서 한없이 키울 수는 없습니다. 의미에 맞는 현실적인 길이를 정하세요. (이름 100, 이메일 255, 글 제목 255 정도가 흔합니다.)

      ### CHAR(n) 과 TEXT

      | 타입          | 설명                                                                           |
      |---------------|--------------------------------------------------------------------------------|
      | \`CHAR(n)\`     | **고정 길이** 문자열 (n 은 0~255). 항상 길이가 같은 값에 사용. 예: 국가 코드 \`'KR'\` |
      | \`TEXT\`        | 길이 지정 없는 긴 글. 최대 65,535바이트(약 64KB, 한글 약 2만 자). 예: 게시글 본문 |
      | \`MEDIUMTEXT\`  | 최대 약 16MB                                                                   |
      | \`LONGTEXT\`    | 최대 약 4GB                                                                    |

      \`TEXT\` 는 편하지만 인덱스를 거는 등 쓰임에 제한이 있어서, **짧은 값(이름·이메일·제목)** 은 \`VARCHAR\`, **긴 본문**만 \`TEXT\` 를 씁니다.

      ## 날짜 / 시간 타입

      | 타입          | 저장 형태               | 범위·특징                                                       |
      |---------------|-------------------------|-----------------------------------------------------------------|
      | \`DATE\`        | \`2026-10-18\`            | 날짜만 (생년월일)                                               |
      | \`TIME\`        | \`13:45:00\`              | 시간만                                                          |
      | \`DATETIME\`    | \`2026-10-18 13:45:00\`   | 날짜 + 시간. 1000-01-01 ~ 9999-12-31. 넣은 값을 **그대로** 저장 |
      | \`TIMESTAMP\`   | \`2026-10-18 13:45:00\`   | 날짜 + 시간. **1970-01-01 ~ 2038-01-19** 까지만 가능. 서버 시간대에 맞춰 자동 변환 |
      | \`YEAR\`        | \`2026\`                  | 연도만                                                          |

      - 둘 중 고민된다면 \`DATETIME\` 이 무난합니다. (\`TIMESTAMP\` 는 2038년 이후를 못 담는 한계가 있습니다.)
      - 날짜·시간 값도 문자열처럼 작은따옴표로 감쌉니다: \`'2026-10-18 13:45:00'\`

      ## 참 / 거짓

      - MySQL 에는 진짜 불리언 타입이 없어서 \`BOOLEAN\` 은 \`TINYINT(1)\` 의 다른 이름입니다. \`TRUE\` 는 1, \`FALSE\` 는 0 으로 저장됩니다.

      ## 어떤 데이터에 어떤 타입? (치트시트)

      | 저장할 데이터        | 추천 타입                       | 이유                                   |
      |----------------------|---------------------------------|----------------------------------------|
      | 사용자 id            | \`INT\` (대규모면 \`BIGINT\`)       | 약 21억 건까지, 크면 BIGINT            |
      | 나이                 | \`TINYINT UNSIGNED\`              | 0~255 로 충분                          |
      | 이름                 | \`VARCHAR(100)\`                  | 짧은 가변 문자열                       |
      | 이메일               | \`VARCHAR(255)\`                  | 흔히 쓰는 최대 길이                    |
      | 게시글 본문          | \`TEXT\`                          | 길이를 예측하기 어려운 긴 글           |
      | 상품 가격            | \`DECIMAL(10,2)\`                 | 오차 없는 소수                         |
      | 가입 시각            | \`DATETIME\`                      | 날짜 + 시간                            |
      | 공개 여부            | \`BOOLEAN\`                       | 참 / 거짓                              |

      이번 실습의 \`id INT\`, \`email VARCHAR(255)\`, \`name VARCHAR(100)\` 도 이 표에서 나온 선택입니다.

      ## 초보자가 자주 하는 실수

      - 컬럼 정의 사이에 **쉼표**를 쓰지 않기, 마지막 컬럼 뒤에 **쉼표**를 쓰기
      - 문장 끝에 **세미콜론(;)**을 쓰지 않기
      - 문자열을 따옴표 없이 쓰거나 큰따옴표만 쓰기 (SQL 문자열은 작은따옴표가 표준)
      - \`VARCHAR\` 에 길이를 쓰지 않기

      ## 다음 스텝의 예고
      지금 단계에서는 제약조건 없이 가장 작은 형태로 시작합니다. 다음 스텝부터 \`PRIMARY KEY\`, \`AUTO_INCREMENT\`, \`NOT NULL\` 을 더해갑니다.
    `,
    objectives: [
      '테이블 · 컬럼 · 행의 개념과 데이터 타입이 필요한 이유 이해',
      'CREATE TABLE 의 기본 구문 이해',
      '정수 타입(TINYINT~BIGINT)의 크기와 범위, UNSIGNED 이해',
      'VARCHAR(n) 의 n 이 글자 수라는 것과 CHAR / TEXT 와의 차이 이해',
      'DECIMAL · DATETIME · BOOLEAN 등 상황별 타입 고르기'
    ],
    exercise: `
1. \`schema.sql\` 에 \`CREATE TABLE users\` 문을 작성하세요.
2. 컬럼 3개 (\`id INT\`, \`email VARCHAR(255)\`, \`name VARCHAR(100)\`) 를 정의하세요.
3. SQL 분석기가 "생성된 테이블 1개" 를 보고하면 성공입니다.
    `.trim(),
    expectedOutput: '생성된 테이블: users',
    localPractice: `이 서비스의 채점은 코드 패턴만 확인하기 때문에, 문법 오류는 **진짜 MySQL** 에서만 드러납니다. 한 번만 환경을 만들어 두면 이후 모든 스텝의 실습에 씁니다.

### 1. MySQL 준비 (둘 중 하나)

\`\`\`bash
# Docker
docker run --name study-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=study -p 3306:3306 -d mysql:8

# Homebrew
brew install mysql && brew services start mysql
\`\`\`

### 2. 접속

\`\`\`bash
docker exec -it study-mysql mysql -uroot -proot study
# Homebrew: mysql -uroot  →  CREATE DATABASE study; USE study;
\`\`\`

### 3. 직접 해보기

1. 이 스텝에서 작성한 \`CREATE TABLE users ...\` 를 그대로 붙여 넣어 실행하세요.
2. \`SHOW TABLES;\`, \`DESC users;\`, \`SHOW CREATE TABLE users;\` 로 결과를 확인하세요.
3. 일부러 쉼표 하나를 지우고 다시 실행해 \`ERROR 1064 (42000)\` 를 확인하세요. 에러 메시지의 \`near '...'\` 가 가리키는 위치를 읽는 연습입니다.
4. 이미 있는 테이블을 다시 \`CREATE TABLE\` 하면 \`ERROR 1050\` 이 납니다. \`DROP TABLE users;\` 후 다시 실행해 보세요.

> 이후 스텝의 실습은 이 \`study\` 데이터베이스를 이어서 사용합니다.
    `.trim()
  },
  initialFiles: [
    {
      name: 'schema.sql',
      path: 'schema.sql',
      language: 'sql',
      content: `-- TODO: users 테이블을 생성하세요.
-- 컬럼: id(정수), email(최대 255자 가변 문자열), name(최대 100자 가변 문자열)
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+`?users`?/i,
        message: 'users 테이블을 생성하는 CREATE TABLE 문이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /\bid\s+INT\b/i,
        message: 'id INT 컬럼이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /\bemail\s+VARCHAR\s*\(\s*255\s*\)/i,
        message: 'email VARCHAR(255) 컬럼이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /\bname\s+VARCHAR\s*\(\s*100\s*\)/i,
        message: 'name VARCHAR(100) 컬럼이 필요합니다.'
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
      content: 'MySQL 의 CREATE TABLE 은 `CREATE TABLE 테이블이름 ( 컬럼정의들 );` 형식입니다.'
    },
    {
      level: 2,
      content: '컬럼은 쉼표로 구분하고, 마지막 컬럼 뒤에는 쉼표를 붙이지 않습니다.'
    },
    {
      level: 3,
      content: '정답 SQL 예시입니다.',
      codeSnippet: `CREATE TABLE users (
  id    INT,
  email VARCHAR(255),
  name  VARCHAR(100)
);
`
    }
  ]
}
