import type { CurriculumStep } from '@/types/curriculum'

export const week_7_2: CurriculumStep = {
  id: 'week-7-2',
  title: '7주차 · React Hooks 기초 (useState, useEffect, useMemo, useCallback)',
  order: 38,
  category: 'advanced',
  content: {
    mission:
      '인자값으로 리스트 필터링 검색어를 받는 검색창 컴포넌트(`SearchContainer`)를 작성하세요.\n1. `useState`를 사용해 검색 키워드(`searchQuery`) 상태를 관리하세요.\n2. `useMemo`를 사용해 전체 아이템(`items`) 중 검색어와 일치하는 아이템들만 필터링한 결과인 `filteredItems`를 메모이제이션 하세요.\n3. `useCallback`을 사용해 검색 입력창이 변경될 때 상태를 업데이트하는 핸들러 `handleSearchChange`를 메모이제이션 하세요.',
    theory: `
# React 핵심 Hooks 4가지 완벽 가이드

React Hooks는 함수형 컴포넌트에서 상태 관리 및 컴포넌트 생명주기 기능을 연결(Hook into)할 수 있게 해주는 API입니다. 4가지 핵심 훅의 동작 원리, 예제 3가지, 그리고 사용 가이드를 학습해 보세요.

---

## 1. useState (컴포넌트 상태 관리)

컴포넌트에 변경 가능한 **상태(State)** 변수를 추가할 때 사용합니다. 상태가 변경되면 React는 해당 컴포넌트를 **리렌더링**합니다.

### 💡 예제 1: 기본 입력 폼 상태 관리
\`\`\`tsx
import React, { useState } from 'react';

export function InputExample() {
  const [text, setText] = useState('');

  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <p>입력한 내용: {text}</p>
    </div>
  );
}
\`\`\`

### 💡 예제 2: 이전 상태에 의존하는 함수형 업데이트 (Functional Update)
\`\`\`tsx
import React, { useState } from 'react';

export function CounterExample() {
  const [count, setCount] = useState(0);

  const incrementTriple = () => {
    // 안전하게 이전 상태값을 기반으로 3번 연속 증가
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
  };

  return <button onClick={incrementTriple}>Count: {count}</button>;
}
\`\`\`

### 💡 예제 3: 객체/배열 상태의 불변성(Immutability) 유지 업데이트
\`\`\`tsx
import React, { useState } from 'react';

interface User { name: string; age: number; }

export function UserProfile() {
  const [user, setUser] = useState<User>({ name: 'Alice', age: 20 });

  const updateAge = () => {
    // 불변성을 지키기 위해 스프레드 연산자(...) 사용
    setUser(prev => ({ ...prev, age: prev.age + 1 }));
  };

  return <button onClick={updateAge}>{user.name} ({user.age}세)</button>;
}
\`\`\`

---

### 📌 useState 사용 가이드

React의 \`useState\`는 컴포넌트의 **상태(State)를 관리하기 위한 가장 기본적이고 핵심적인 Hook**입니다.

하지만 모든 변수를 \`useState\`로 다룰 필요는 없으며, 남용할 경우 불필요한 리렌더링이나 코드 복잡성을 유발할 수 있습니다. \`useState\`의 올바른 사용 타이밍과 피해야 할 패턴을 정리해 드립니다.

---

## ✅ 언제 사용해야 하는가? (Use Cases)

\`useState\`는 "값이 변경되었을 때 화면(UI)이 다시 그려져야 하는 데이터"에 사용합니다.

* **사용자 입력 및 폼(Form) 관리**
  - 텍스트 입력창(\`input\`), 체크박스, 드롭다운, 토글 버튼 등의 상태.

* **UI의 노출/비노출 상태**
  - 모달(Modal) 창 열림/닫힘, 드롭다운 메뉴 열림/닫힘, 탭 전환 상태.

* **비동기 데이터 및 로딩 상태**
  - API 요청 결과 데이터, 로딩 중 표시(\`isLoading\`), 에러 메시지(\`error\`).

* **동적 인터랙션 결과**
  - 좋아요 버튼 클릭 수, 장바구니 아이템 목록, 드래그 앤 드롭 위치 데이터.

> **💡 판단 기준 Check!**  
> *"이 값이 바뀌면 화면에 바로 반영되어 사용자가 변화를 알아차려야 하는가?"* $\\rightarrow$ **YES면 \`useState\`**

---

## ❌ 언제 사용하지 말아야 하는가? (Anti-Patterns)

### 1. 다른 상태나 Props로부터 계산할 수 있는 값

* **Anti-Pattern:** 기존 상태를 조합하여 구할 수 있는 값을 별도의 State로 관리하는 경우.
* **이유:** 상태 간 동기화 문제가 발생하고, 불필요한 리렌더링이 유발됩니다.

\`\`\`jsx
// ❌ Bad: firstName과 lastName으로 fullText를 굳이 상태로 관리
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [fullName, setFullName] = useState(''); // 불필요한 State

// ✅ Good: 렌더링 과정에서 단순 변수로 계산
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const fullName = \`\${firstName} \${lastName}\`; // 렌더링 중 자동 계산
\`\`\`

### 2. UI 렌더링과 전혀 관계없는 내부 변수

* **Anti-Pattern:** 값이 바뀌어도 화면이 다시 그려질 필요가 없는 데이터를 \`useState\`로 관리.
* **이유:** 값 변경 시마다 컴포넌트가 불필요하게 리렌더링됩니다.
* **해결책:** \`useRef\`나 컴포넌트 외부/내부의 일반 변수를 사용하세요.

\`\`\`jsx
// ❌ Bad: 클릭 횟수를 추적하여 로깅하지만, 화면에는 표시하지 않는 경우
const [clickCount, setClickCount] = useState(0);

// ✅ Good: useRef를 사용해 불필요한 리렌더링 방지
const clickCountRef = useRef(0);
const handleClick = () => {
  clickCountRef.current += 1;
};
\`\`\`

### 3. Prop Drilled Data (너무 깊은 Props 전달)

* **Anti-Pattern:** 상위 컴포넌트에서 생성한 \`useState\`를 5~6단계 아래 자식 컴포넌트로 계속 전달하는 경우.
* **이유:** 중간 컴포넌트들이 불필요하게 리렌더링되고 코드 유지보수가 극도로 힘들어집니다.
* **해결책:** **Context API**나 Zustand, Redux 같은 상태 관리 라이브러리를 사용하세요.

### 4. 복잡하고 서로 연관된 다중 상태

* **Anti-Pattern:** 하나의 기능에서 여러 상태가 동시에 변경되어야 할 때 개별 \`useState\`를 대량으로 선언하는 경우.
* **해결책:** 상태 논리가 복잡하다면 \`useReducer\`를 고려하는 것이 코드 가독성과 유지보수 면에서 훨씬 좋습니다.

---

## 📊 정리표

| 구 분 | useState 사용 권장 | useRef / 일반 변수 사용 권장 |
| --- | --- | --- |
| **화면 반영 여부** | 값이 변하면 **UI가 업데이트**되어야 함 | 값이 변해도 **UI 변화 없음** |
| **주요 예시** | 폼 입력값, Modal 열림 상태, API 데이터 | 타이머 ID, 이전 값 저장, DOM 요소 참조 |
| **성능 영향** | State 변경 시 **컴포넌트 리렌더링** | Ref 변경 시 **리렌더링 미발생** |

---

## 2. useEffect (사이드 이펙트 및 외부 시스템 연동)

렌더링 결과가 DOM에 반영된 후 **사이드 이펙트(Side Effects: API 호출, 이벤트 구독, 타이머 등)**를 수행합니다.

### 💡 예제 1: API 호출 및 경쟁 상태(Race Condition) 방지 클린업
\`\`\`tsx
import React, { useState, useEffect } from 'react';

export function DataFetcher({ userId }: { userId: string }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let active = true;
    fetch(\`https://api.example.com/users/\${userId}\`)
      .then(res => res.json())
      .then(data => {
        if (active) setUser(data);
      });

    // 클린업 함수: userId가 바뀌거나 언마운트 시 이전 요청 무시
    return () => { active = false; };
  }, [userId]); // userId 변경 시 재실행

  return <div>{user ? user.name : 'Loading...'}</div>;
}
\`\`\`

### 💡 예제 2: 전역 DOM 이벤트 리스너 등록 및 해제
\`\`\`tsx
import React, { useState, useEffect } from 'react';

export function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);

    // 메모리 누수 방지를 위한 이벤트 해제 클린업
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // 빈 배열: 마운트 시 1회 등록, 언마운트 시 해제

  return <div>Current Scroll: {scrollY}px</div>;
}
\`\`\`

### 💡 예제 3: 타이머 설정 및 주기적 동작 처리
\`\`\`tsx
import React, { useState, useEffect } from 'react';

export function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timerId = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timerId); // 타이머 클린업
  }, []);

  return <div>경과 시간: {seconds}초</div>;
}
\`\`\`

---

### 📌 useEffect 사용 가이드

React의 \`useEffect\`는 컴포넌트가 렌더링된 후 **외부 시스템과 동기화(Side Effect)하기 위한 Hook**입니다.

하지만 \`useEffect\`를 단순히 "데이터가 변경될 때 실행하는 함수"로 오해하면 불필요한 리렌더링, 무한 루프, 예측하기 어려운 버그가 발생하기 쉽습니다.

---

## ✅ 언제 사용해야 하는가? (Use Cases)

\`useEffect\`는 **React 외부의 시스템과 컴포넌트를 연결할 때** 사용합니다.

* **외부 데이터 가져오기 (Data Fetching)**
  - 컴포넌트 마운트 시 서버 API 호출, REST API / GraphQL 데이터 수신

* **외부 라이브러리 연동 및 직접적인 DOM 조작**
  - D3.js, Chart.js, 지도 API(카카오맵, Google Maps) 등의 외부 캔버스/라이브러리 초기화 및 업데이트

* **구독(Subscription) 및 이벤트 리스너 등록**
  - \`WebSocket\`, \`EventSource\` 연결 설정 및 해제
  - global \`window\` / \`document\` 이벤트 리스너 등록 (\`scroll\`, \`resize\`, \`keydown\`)

* **타이머 및 비동기 작업 설정**
  - \`setInterval\`, \`setTimeout\`을 통한 타이머 동작 설정 및 정제(Cleanup)

> **💡 판단 기준**  
> *"React가 직접 관리하지 못하는 외부 세계(네트워크, 브라우저 DOM, 외부 라이브러리)와 소통하는 작업인가?"*  
> $\\rightarrow$ **YES면 \`useEffect\`**

---

## ❌ 언제 사용하지 말아야 하는가? (Anti-Patterns)

### 1. 렌더링을 위한 데이터 변환 및 계산

* **Anti-Pattern:** State가 바뀔 때 다른 State를 업데이트하려고 \`useEffect\`를 사용하는 경우
* **문제점:** 불필요한 **2차 렌더링**이 발생하여 화면이 깜빡이고 성능이 저하됩니다.

\`\`\`jsx
// ❌ BAD: useEffect로 파생된 상태 업데이트 (렌더링 2번 발생)
function TodoList({ todos, filter }) {
  const [visibleTodos, setVisibleTodos] = useState([]);

  useEffect(() => {
    setVisibleTodos(getFilteredTodos(todos, filter));
  }, [todos, filter]);
}

// ✅ GOOD: 렌더링 도중 직접 계산 (계산량이 많다면 useMemo 활용)
function TodoList({ todos, filter }) {
  const visibleTodos = getFilteredTodos(todos, filter);
}
\`\`\`

---

### 2. 사용자 이벤트 처리 (User Events)

* **Anti-Pattern:** 버튼 클릭 등 사용자 행동에 대한 응답을 \`useEffect\`로 처리하는 경우
* **문제점:** 이벤트 핸들러가 아닌 State 변화를 추적하게 되면서 코드의 의도가 모호해지고, 의도치 않은 시점에 로직이 실행될 수 있습니다.

\`\`\`jsx
// ❌ BAD: State 변경을 감지하여 결제 요청 실행
useEffect(() => {
  if (isSubmitted) {
    postOrder(cart);
  }
}, [isSubmitted, cart]);

// ✅ GOOD: 이벤트 핸들러 내부에서 직접 실행
const handleSubmit = () => {
  postOrder(cart);
};
\`\`\`

---

### 3. Props 변경 시 모든 State 초기화

* **Anti-Pattern:** Props(예: \`userId\`)가 바뀔 때 자식 컴포넌트의 Form State를 초기화하려고 \`useEffect\`를 사용하는 경우
* **문제점:** 첫 렌더링 후 \`useEffect\`가 실행되어 이전 값이 순간적으로 보였다가 지워지는 현상이 발생합니다.
* **해결책:** **\`key\` 속성**을 활용하여 컴포넌트를 재초기화하세요.

\`\`\`jsx
// ❌ BAD: useEffect로 State 초기화
function Profile({ userId }) {
  const [comment, setComment] = useState('');

  useEffect(() => {
    setComment('');
  }, [userId]);
}

// ✅ GOOD: key를 부여하여 React가 알아서 컴포넌트를 새로 마운트하도록 유도
<Profile userId={userId} key={userId} />
\`\`\`

---

### 4. 부모 컴포넌트에 상태 변경 알리기 (Pass State Up)

* **Anti-Pattern:** 자식의 State 변경을 부모에게 알리기 위해 \`useEffect\`에서 부모의 callback 함수를 호출하는 경우
* **문제점:** 자식 렌더링 $\\rightarrow$ \`useEffect\` 실행 $\\rightarrow$ 부모 State 변경 $\\rightarrow$ 부모/자식 재렌더링의 비효율적인 흐름이 생성됩니다.
* **해결책:** 자식 컴포넌트의 이벤트 핸들러 내에서 부모의 callback을 직접 호출하거나, 상태를 부모로 끌어올리세요(Lifting State Up).

---

## 📊 Quick Guide: 어떤 방식으로 처리해야 할까?

| 상황 / 목적 | 올바른 처리 방식 |
| --- | --- |
| **API 호출 / 외부 이벤트 구독** | \`useEffect\` 사용 (Cleanup 함수 작성 필수) |
| **State / Props 기반 데이터 계산** | **렌더링 중 직접 계산** (필요시 \`useMemo\`) |
| **버튼 클릭, Form 제출 등 반응** | **이벤트 핸들러** (\`onClick\`, \`onSubmit\`) 내부 처리 |
| **Props 변경 시 State 전체 초기화** | 컴포넌트에 **\`key\` Prop** 전달 |
| **렌더링과 상관없는 DOM 측정/조작** | \`useLayoutEffect\` 또는 Ref 콜백 고려 |

---

## 🧹 useEffect의 Cleanup(정리) 함수 가이드

\`useEffect\`의 **Cleanup(정리) 함수**는 컴포넌트가 언마운트되거나, 의존성 배열(Dependency Array)의 값이 변경되어 **다음 효과가 실행되기 직전에 기존 작업을 정리**하는 역할을 합니다.

올바르게 작성하지 않으면 메모리 누수, 원치 않는 중복 실행, 비동기 데이터 경합 상태(Race Condition) 등의 버그가 발생할 수 있습니다.

---

### 1. Cleanup 함수는 언제 실행될까? (실행 시점)

Cleanup 함수는 return 구문에 전달하는 함수 형태로 작성합니다.

\`\`\`jsx
useEffect(() => {
  // 1. Setup (효과 실행)
  
  return () => {
    // 2. Cleanup (정리 작업)
  };
}, [deps]);
\`\`\`

#### 💡 실행 시점 정리

1. **컴포넌트가 언마운트(Unmount)될 때**
   - 화면에서 해당 컴포넌트가 완전히 사라질 때 Cleanup 함수가 최종적으로 실행됩니다.

2. **의존성 배열(\`deps\`)의 값이 변경되어 리렌더링될 때**
   - **[중요]** 새로운 Effect가 실행되기 **바로 직전**에, 이전 Effect가 남겨둔 Cleanup 함수가 먼저 실행됩니다.
   - *순서:* \`이전 Effect의 Cleanup\` $\\rightarrow$ \`새로운 Effect의 Setup\`

---

### 2. 메모리 누수를 방지하는 대표적인 작성 방법

#### ① 이벤트 리스너 등록 해제 (\`addEventListener\`)

글로벌 객체(\`window\`, \`document\`)에 등록된 이벤트 리스너를 제거하지 않으면 컴포넌트가 사라져도 메모리에 계속 남아있게 됩니다.

\`\`\`jsx
// ❌ BAD: 리스너가 누적되어 메모리 누수 및 중복 이벤트 발생
useEffect(() => {
  window.addEventListener('resize', handleResize);
}, []);

// ✅ GOOD: Cleanup 함수에서 removeEventListener 호출
useEffect(() => {
  const handleResize = () => setWidth(window.innerWidth);
  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
\`\`\`

---

#### ② 타이머 해제 (\`setInterval\`, \`setTimeout\`)

타이머를 정제하지 않으면 컴포넌트가 언마운트된 후에도 백그라운드에서 계속 실행되거나 state 업데이트 오류를 일으킵니다.

\`\`\`jsx
// ❌ BAD: 컴포넌트가 사라져도 타이머가 계속 작동
useEffect(() => {
  setInterval(() => {
    console.log('틱!');
  }, 1000);
}, []);

// ✅ GOOD: clearInterval로 타이머 제거
useEffect(() => {
  const timerId = setInterval(() => {
    console.log('틱!');
  }, 1000);

  return () => {
    clearInterval(timerId);
  };
}, []);
\`\`\`

---

#### ③ 웹소켓 / 데이터 구독 해제 (Subscriptions)

외부 서비스 구독이나 소켓 연결은 언마운트 시점에 반드시 닫아주어야 합니다.

\`\`\`jsx
useEffect(() => {
  const socket = connectToSocket(url);

  return () => {
    socket.disconnect(); // 연결 종료
  };
}, [url]);
\`\`\`

---

#### ④ 비동기 요청 경합 상태(Race Condition) 방지

빠르게 입력이나 탭을 전환할 때, 이전 비동기 요청 결과가 나중에 도착하여 최신 데이터를 덮어버리는 문제가 생깁니다. 이를 \`ignore\` 플래그나 \`AbortController\`로 취소/무시할 수 있습니다.

\`\`\`jsx
// ✅ GOOD: AbortController를 활용한 비동기 요청 취소
useEffect(() => {
  const controller = new AbortController();

  async function fetchData() {
    try {
      const response = await fetch(\`/api/user/\${userId}\`, {
        signal: controller.signal,
      });
      const data = await response.json();
      setUser(data);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error(error);
      }
    }
  }

  fetchData();

  return () => {
    controller.abort(); // 이전/언마운트 시점의 요청 취소
  };
}, [userId]);
\`\`\`

---

### 📊 요약 및 핵심 법칙

| 유형 | Setup (구독/생성) | Cleanup (해제/정리) |
| --- | --- | --- |
| **이벤트** | \`addEventListener\` | \`removeEventListener\` |
| **타이머** | \`setInterval\` / \`setTimeout\` | \`clearInterval\` / \`clearTimeout\` |
| **소켓/구독** | \`socket.subscribe()\` | \`socket.unsubscribe()\` |
| **비동기 요청** | \`fetch(url, { signal })\` | \`controller.abort()\` |

> **💡 골든 룰:**  
> \`useEffect\` 안에서 무언가를 **생성/등록/연결**했다면, return 구문에서 반드시 이를 **제거/해제/단선**시키는 대칭형 코드 구조를 작성하세요!

---

## ⚡ useEffect vs useLayoutEffect 완벽 비교

\`useEffect\`와 \`useLayoutEffect\`는 문법과 역할이 완전히 동일하지만, 실행되는 시점(Timing)과 **브라우저 렌더링에 미치는 영향**에서 결정적인 차이가 있습니다.

가장 큰 차이는 "화면이 그려지기 전에 실행되느냐(동기), 그려진 후에 실행되느냐(비동기)"입니다.

---

### ⏳ 브라우저 렌더링 파이프라인과 실행 시점 비교

React가 컴포넌트를 변경하고 브라우저가 화면을 그리는 과정(DOM 변이 및 레이아웃 측정)에서 두 Hook의 실행 위치는 다음과 같습니다.

\`\`\`text
React 렌더링 (Virtual DOM 계산)
       │
       ▼
React가 실제 DOM 업데이트 (DOM 변이 완료)
       │
       ├─► 1. useLayoutEffect 실행 (동기 / 블로킹)
       │      └─► DOM 조작/치수 측정 및 재계산 가능
       │
       ▼
브라우저 화면 페인팅 (Browser Paint - 사용자가 눈으로 보는 시점)
       │
       └─► 2. useEffect 실행 (비동기 / 논블로킹)
              └─► API 요청, 이벤트 리스너 등록 등
\`\`\`

---

### 🔍 핵심 차이점 분석

#### 1. \`useEffect\` (비동기 / 논블로킹)

* **실행 시점:** 브라우저가 화면을 **그린 후(Paint 완료 후)** 실행됩니다.
* **특징:** 화면 렌더링을 방해하지 않으므로 사용자 경험(UI 반응성)에 유리합니다.
* **단점:** Effect 내부에서 DOM을 조작하거나 State를 변경하면, 사용자 눈에 화면 깜빡임(Flicker)이 보일 수 있습니다.
* **주요 용도:** API 호출, 이벤트 리스너 등록, 타이머 설정 등 대부분의 Side Effect.

#### 2. \`useLayoutEffect\` (동기 / 블로킹)

* **실행 시점:** React가 DOM을 업데이트한 직후, **브라우저가 화면을 그리기 전(Paint 전)** 동기적으로 실행됩니다.
* **특징:** 이 Hook 내부의 모든 코드와 State 업데이트가 끝날 때까지 브라우저 화면 출력이 차단(Block)됩니다.
* **장점:** 화면에 레이아웃이 그려지기 전에 DOM 상태를 변경하므로 **화면 깜빡임이 전혀 없습니다.**
* **단점:** 무거운 연산을 넣으면 화면이 뜨는 속도가 느려집니다.
* **주요 용도:** DOM 요소의 크기/위치 측정, 렌더링 직후 위치 레이아웃 재조정, 애니메이션 준비.

---

### 💻 코드 비교: 화면 깜빡임 현상

상단 모달이나 툴팁의 위치를 요소 크기에 맞춰 계산하는 상황을 예로 들어보겠습니다.

#### ❌ \`useEffect\` 사용 시 (깜빡임 발생 가능)

\`\`\`jsx
function Tooltip() {
  const [height, setHeight] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    // 화면이 그려진 '후'에 높이를 측정하고 State 변경
    setHeight(ref.current.getBoundingClientRect().height);
  }, []);

  // 1. height = 0 상태로 브라우저에 화면이 먼저 그려짐 (깜빡!)
  // 2. height 측정 후 재렌더링되며 정상 위치로 이동
  return <div ref={ref} style={{ top: \`\${height}px\` }}>툴팁</div>;
}
\`\`\`

#### ✅ \`useLayoutEffect\` 사용 시 (깜빡임 없음)

\`\`\`jsx
function Tooltip() {
  const [height, setHeight] = useState(0);
  const ref = useRef(null);

  useLayoutEffect(() => {
    // 브라우저가 화면을 그리기 '전'에 높이 측정 및 State 반영
    setHeight(ref.current.getBoundingClientRect().height);
  }, []);

  // 화면을 그리기 전에 이미 계산된 height 상태가 적용되어 한 번에 완벽하게 렌더링됨
  return <div ref={ref} style={{ top: \`\${height}px\` }}>툴팁</div>;
}
\`\`\`

---

### 📊 요약표

| 비교 항목 | \`useEffect\` | \`useLayoutEffect\` |
| --- | --- | --- |
| **실행 시점** | 브라우저 Paint **후** (비동기) | 브라우저 Paint **전** (동기) |
| **렌더링 블로킹** | ❌ 블로킹 안 함 (사용자 응답성 우수) | ⭕ 동기적 실행으로 블로킹 발생 |
| **화면 깜빡임** | DOM 변경 시 깜빡임 발생 가능 | 깜빡임 완전히 방지 가능 |
| **주요 유스케이스** | API Fetch, 데이터 구독, 이벤트 설정 | DOM 크기/위치 측정, 레이아웃 재배치 |
| **권장 사용 빈도** | **기본 선택 (95% 이상)** | **특수 상황에만 선택적 사용** |

> **💡 선택 가이드라인**  
> 우선 **\`useEffect\`를 기본으로 사용**하세요. 만약 렌더링 후 DOM 상태 조작으로 인해 **화면이 깜빡이거나 요동치는 현상이 발생할 때만 \`useLayoutEffect\`로 교체**하는 것이 모범 답안입니다.

---

## 🟢 React useEffect vs Vue 3 (Composition API) 완벽 매칭

React의 \`useEffect\`는 Vue의 **라이프사이클 훅(Lifecycle Hooks)** 및 **반응형 감시자(Watchers)** 시스템과 비교할 수 있습니다.

Vue는 React의 \`useEffect\` 하나가 담당하는 역할을 **목적에 따라 직관적으로 분리**해 두었기 때문에, 상황별로 1:1 매칭해서 이해하는 것이 가장 쉽습니다.

---

### 🔄 주요 기능별 1:1 비교

#### 1. 의존성 배열이 없는 경우: \`watchEffect\`

의존성 배열 없이 내부에서 사용된 반응형 변수(State/Ref)를 알아서 감지하고 실행한다는 점에서 Vue 3의 \`watchEffect\`와 가장 유사합니다.

* **React:**
\`\`\`jsx
useEffect(() => {
  console.log(\`현재 카운트: \${count}\`);
}); // 매 렌더링 및 count 변경 시 실행
\`\`\`

* **Vue 3:**
\`\`\`vue
<script setup>
import { ref, watchEffect } from 'vue';
const count = ref(0);

watchEffect(() => {
  console.log(\`현재 카운트: \${count.value}\`); // count를 자동 감지하여 실행
});
</script>
\`\`\`

---

#### 2. 특정 State 변동 감지: \`watch\`

의존성 배열 \`[deps]\`에 특정 변수를 지정하여 해당 값이 바뀔 때만 실행하는 구조는 Vue의 \`watch\`와 동일합니다.

* **React:**
\`\`\`jsx
useEffect(() => {
  console.log(\`userId 변경됨: \${userId}\`);
}, [userId]);
\`\`\`

* **Vue 3:**
\`\`\`vue
<script setup>
import { ref, watch } from 'vue';
const userId = ref(1);

watch(userId, (newVal, oldVal) => {
  console.log(\`userId 변경됨: \${newVal}\`);
});
</script>
\`\`\`

---

#### 3. 마운트 시점 (최초 1회 실행): \`onMounted\`

빈 의존성 배열 \`[]\`을 넘겨 컴포넌트가 화면에 붙었을 때(마운트) API 요청이나 DOM 접근을 처리하는 패턴은 Vue의 \`onMounted\`에 해당합니다.

* **React:**
\`\`\`jsx
useEffect(() => {
  fetchData(); // 마운트 시 1회 실행
}, []);
\`\`\`

* **Vue 3:**
\`\`\`vue
<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  fetchData(); // 마운트 완료 시 실행
});
</script>
\`\`\`

---

#### 4. Cleanup (정리/해제 작업): \`onUnmounted\` & \`onWatcherCleanup\`

React의 \`useEffect\`에서 \`return () => { ... }\`으로 전달하는 Cleanup 함수는 Vue에서 크게 두 가지로 대응됩니다.

1. **컴포넌트 언마운트 시 정리:** **Vue의 \`onUnmounted\`** 훅
2. **Watch 재실행 전 이전 작업 정리:** Vue 3.5+의 **\`onWatcherCleanup\`** (또는 \`watch\` 내부 \`onCleanup\` 콜백)

* **React:**
\`\`\`jsx
useEffect(() => {
  const timer = setInterval(() => {}, 1000);
  return () => clearInterval(timer); // 정리 작업
}, []);
\`\`\`

* **Vue 3:**
\`\`\`vue
<script setup>
import { onMounted, onUnmounted } from 'vue';

let timer;
onMounted(() => {
  timer = setInterval(() => {}, 1000);
});
onUnmounted(() => {
  clearInterval(timer); // 컴포넌트 파괴 시 정리
});
</script>
\`\`\`

---

### 📊 Quick Summary (요약표)

| React \`useEffect\` 패턴 | Vue 3 (Composition API) 매칭 | 주요 용도 |
| --- | --- | --- |
| \`useEffect(() => {}, [])\` | \`onMounted(() => {})\` | 마운트 시 초기 API 요청, DOM 초기화 |
| \`useEffect(() => {}, [deps])\` | \`watch(deps, () => {})\` | 특정 상태 변화에 따른 Side Effect 수행 |
| \`useEffect(() => {})\` | \`watchEffect(() => {})\` | 내부 반응형 변수 자동 추적 및 실행 |
| \`return () => { ... }\` | \`onUnmounted(() => {})\` / \`onWatcherCleanup()\` | 이벤트 리스너 해제, 타이머 제거 |

---

### 💡 핵심 패러다임의 차이

* **React (\`useEffect\`):**  
  렌더링 모델을 따릅니다. "렌더링이 일어난 후, 이 조건(의존성)에 맞춰 외부 세계와 동기화한다"는 단일 아이디어로 모든 라이프사이클을 통괄합니다.
* **Vue (\`watch\` / Lifecycle Hooks):**  
  반응형 시스템을 따릅니다. "어떤 이벤트(마운트/상태 변경)가 발생했을 때 이 콜백 함수를 실행한다"처럼 목적별로 explicit(명시적)하게 나누어져 있습니다.

---

## 3. useMemo (연산 결과 메모이제이션)

계산 비용이 큰(Expensive) 연산의 결과값을 **캐싱(메모이제이션)**하여, 불필요한 재계산을 방지합니다.

### 💡 예제 1: 대용량 배열 필터링 및 검색 연산 최적화
\`\`\`tsx
import React, { useState, useMemo } from 'react';

export function FilterList({ items }: { items: string[] }) {
  const [query, setQuery] = useState('');

  // items나 query가 변경될 때만 필터링 연산 재수행
  const filteredItems = useMemo(() => {
    return items.filter(item => item.toLowerCase().includes(query.toLowerCase()));
  }, [items, query]);

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <ul>{filteredItems.map((item, i) => <li key={i}>{item}</li>)}</ul>
    </div>
  );
}
\`\`\`

### 💡 예제 2: 복잡한 통계/소수(Prime) 계산 최적화
\`\`\`tsx
import React, { useState, useMemo } from 'react';

function calculatePrimes(max: number) {
  const primes = [];
  for (let i = 2; i <= max; i++) {
    let isPrime = true;
    for (let j = 2; j * j <= i; j++) {
      if (i % j === 0) { isPrime = false; break; }
    }
    if (isPrime) primes.push(i);
  }
  return primes;
}

export function PrimeCalculator({ max }: { max: number }) {
  const [count, setCount] = useState(0);

  // count가 바뀌어 컴포넌트가 리렌더링되어도 max가 바뀌지 않으면 무거운 계산 skip!
  const primes = useMemo(() => calculatePrimes(max), [max]);

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Unrelated Re-render ({count})</button>
      <p>Found {primes.length} primes up to {max}</p>
    </div>
  );
}
\`\`\`

### 💡 예제 3: 하위 컴포넌트로 전달할 객체/배열 참조(Reference) 유지
\`\`\`tsx
import React, { useState, useMemo } from 'react';

export function ParentComponent() {
  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState({ name: 'Bob', role: 'admin' });

  // 객체 딥 리터럴 생성을 방지하여 자식 컴포넌트의 불필요한 리렌더링 방지
  const userInfo = useMemo(() => ({
    name: user.name,
    role: user.role
  }), [user.name, user.role]);

  return <ChildUserCard info={userInfo} />;
}
\`\`\`

---

### 📌 useMemo 사용 가이드

| ✅ 언제 사용해야 하는가? (Use Cases) | ❌ 언제 사용하지 말아야 하는가? (Anti-Patterns) |
| :--- | :--- |
| • 배열 1,000개 이상의 필터링, 정렬, 맵 연산 | • **단순 덧셈, 기본 텍스트 포맷팅**: \`const fullName = \`\${first} \${last}\`\` 같은 가벼운 연산은 \`useMemo\` 캐싱 오버헤드가 더 큽니다. |
| • \`React.memo\`로 최적화된 하위 컴포넌트에 객체/배열 Props 전달 시 참조 유지 | • **의존성 배열을 빈 \`[]\`로 두고 내부 상태를 무시할 때**: 갱신되지 않는 버그가 생깁니다. |

---

## 4. useCallback (함수 참조 메모이제이션)

컴포넌트가 리렌더링될 때마다 **새 함수 객체가 생성되는 것을 방지**하고, **동일한 함수 참조**를 유지합니다.

### 💡 예제 1: React.memo로 메모이제이션된 자식 컴포넌트에 콜백 전달
\`\`\`tsx
import React, { useState, useCallback } from 'react';

// React.memo로 최적화된 자식 버튼
const ExpensiveButton = React.memo(({ onClick, label }: { onClick: () => void; label: string }) => {
  console.log(\`\${label} Button Rendered\`);
  return <button onClick={onClick}>{label}</button>;
});

export function Parent() {
  const [count, setCount] = useState(0);

  // useCallback을 쓰지 않으면 Parent 리렌더링 시마다 handleClick 참조가 바뀌어 ExpensiveButton도 리렌더링됨
  const handleClick = useCallback(() => {
    console.log('Button clicked');
  }, []); // 의존성 없음: 함수 참조 영구 유지

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Parent State ({count})</button>
      <ExpensiveButton onClick={handleClick} label="Memoized Child Button" />
    </div>
  );
}
\`\`\`

### 💡 예제 2: useEffect의 의존성 배열에 포함되는 함수 전달
\`\`\`tsx
import React, { useState, useEffect, useCallback } from 'react';

export function SearchResults({ query }: { query: string }) {
  // useEffect 내부에서 호출되는 함수를 useCallback으로 감싸기
  const fetchData = useCallback(async () => {
    const res = await fetch(\`https://api.example.com/search?q=\${query}\`);
    return res.json();
  }, [query]);

  useEffect(() => {
    fetchData().then(data => console.log(data));
  }, [fetchData]); // fetchData의 참조가 무한히 바뀌어 무한 루프가 발생하는 것을 방지

  return <div>Search Query: {query}</div>;
}
\`\`\`

### 💡 예제 3: 커스텀 훅(Custom Hook) 내 반환 함수 최적화
\`\`\`tsx
import React, { useState, useCallback } from 'react';

export function useToggle(initialState = false) {
  const [state, setState] = useState(initialState);

  // 커스텀 훅 사용처에서 불필요한 리렌더링을 일으키지 않도록 toggle 함수 메모이제이션
  const toggle = useCallback(() => {
    setState(prev => !prev);
  }, []);

  return [state, toggle] as const;
}
\`\`\`

---

### 📌 useCallback 사용 가이드

| ✅ 언제 사용해야 하는가? (Use Cases) | ❌ 언제 사용하지 말아야 하는가? (Anti-Patterns) |
| :--- | :--- |
| • \`React.memo\`로 감싸진 자식 컴포넌트에 이벤트 핸들러 함수를 Props로 넘길 때 | • **일반 HTML 엘리먼트(\`button\`, \`input\`)에 전달할 때**: \`<button onClick={useCallback(...)}>내용</button>\`은 하위 최적화 대상이 없어 아무런 이점이 없으며 메모리만 소모합니다. |
| • 다른 Custom Hook이나 \`useEffect\`의 의존성 배열로 함수가 전달될 때 | • **모든 함수에 무조건 \`useCallback\` 적용하기**: 최적화 코드가 오히려 가독성을 떨어뜨리고 인라인 함수 생성보다 비쌀 수 있습니다. |
`,
    objectives: [
      'useState를 사용해 searchQuery 상태를 선언할 것',
      'useMemo를 사용해 searchQuery 조건에 따라 items를 필터링할 것',
      'useCallback을 사용해 입력값 변경 이벤트 핸들러를 메모이제이션할 것'
    ],
    exercise: "1. `SearchContainer.tsx`에서 `useMemo`를 활용해 `searchQuery`에 맞게 `ITEMS`를 필터링하는 `filteredItems`를 만드세요.\n2. `useCallback`을 활용해 인풋 변경 시 실행되는 `handleSearchChange` 핸들러 함수를 정의하고 `input` 요소의 `onChange` 속성에 바인딩하세요."
  },
  initialFiles: [
    {
      name: 'SearchContainer.tsx',
      path: 'SearchContainer.tsx',
      content: `"use client";
import React, { useState, useMemo, useCallback } from 'react';

const ITEMS = ['Apple', 'Banana', 'Orange', 'Pineapple', 'Grapes'];

export default function SearchContainer() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // 1. 여기에 useMemo를 작성해 ITEMS 리스트를 searchQuery로 필터링하세요 (소문자/대문자 무관하게 비교 권장).
  // 2. 여기에 useCallback을 작성해 인풋 onChange 이벤트용 함수를 메모이제이션 하세요.

  return (
    <div>
      <input type="text" placeholder="Search..." />
      <ul>
        {ITEMS.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  );
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'SearchContainer.tsx',
        pattern: 'useMemo(',
        message: 'useMemo 훅을 사용하여 필터링 작업을 연산 최적화해야 합니다.'
      },
      {
        type: 'includes',
        target: 'SearchContainer.tsx',
        pattern: 'useCallback(',
        message: 'useCallback 훅을 사용하여 입력값 변경 핸들러를 최적화해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '`const filteredItems = useMemo(() => ITEMS.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase())), [searchQuery]);` 형태로 필터링 리스트를 선언해 보세요.'
    },
    {
      level: 2,
      content: '`const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value), []);` 형태로 이벤트 핸들러를 구현하고 input 태그에 `onChange={handleSearchChange}`를 연결하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `"use client";
import React, { useState, useMemo, useCallback } from 'react';

const ITEMS = ['Apple', 'Banana', 'Orange', 'Pineapple', 'Grapes'];

export default function SearchContainer() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    return ITEMS.filter(item =>
      item.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  return (
    <div>
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={handleSearchChange}
      />
      <ul>
        {filteredItems.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  );
}`
    }
  ]
}