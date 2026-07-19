import type { CurriculumStep } from '@/types/curriculum'

export const week_9_3: CurriculumStep = {
  id: 'week-9-3',
  title: '9주차 · 로그인 폼 개발 및 스키마 검증 (react-hook-form + zod)',
  order: 51,
  category: 'advanced',
  content: {
    mission:
      '사용자가 입력한 이메일과 비밀번호를 검증하는 Zod 스키마 \`loginSchema\`를 설계하세요.\n- 이메일(\`email\`): 유효한 이메일 형태가 아닐 시 \`"올바른 이메일 형식이 아닙니다."\` 에러 메시지 출력\n- 비밀번호(\`password\`): 최소 8자리 이상이 아닐 시 \`"비밀번호는 최소 8자리 이상이어야 합니다."\` 에러 메시지 출력',
    theory: `
      ## 1. react-hook-form
      React 환경에서 불필요한 리렌더링 없이 인풋 데이터를 효율적으로 수집하고 제어하는 폼 관리 라이브러리입니다.

      ## 2. Zod
      TypeScript-first 스키마 선언 및 데이터 검증(validation) 라이브러리입니다.
      \`\`\`ts
      import { z } from 'z';

      const schema = z.object({
        username: z.string().min(3, "최소 3자 이상"),
      });
      \`\`\`
    `,
    objectives: [
      'z.object()를 선언하여 loginSchema 스키마를 정의할 것',
      'email 필드를 이메일 형식 지정 및 에러 메시지 정의와 함께 명시할 것',
      'password 필드를 최소 길이 8글자 제한 및 에러 메시지 정의와 함께 명시할 것'
    ],
    exercise: "1. `LoginForm.tsx`에 `react-hook-form`과 `zod` 유효성 스키마를 주입하여 폼을 연결하세요.\n2. 제출 이벤트를 가로채 에러를 필터링하고 통과된 폼 필드들을 API 엔드포인트로 발송하세요."
  },
  initialFiles: [
    {
      name: 'loginSchema.ts',
      path: 'schemas/loginSchema.ts',
      content: `import { z } from 'zod';

// 여기에 이메일과 패스워드 검증을 수행하는 loginSchema를 선언하여 export 하세요.
`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'schemas/loginSchema.ts',
        pattern: 'z.object({',
        message: 'z.object()를 이용해 스키마 객체를 만들어야 합니다.'
      },
      {
        type: 'includes',
        target: 'schemas/loginSchema.ts',
        pattern: '.email(',
        message: 'email 필드는 z.string().email() 형식을 적용해야 합니다.'
      },
      {
        type: 'includes',
        target: 'schemas/loginSchema.ts',
        pattern: '.min(8',
        message: 'password 필드는 최소 8자리 이상(.min(8, ...)) 제한 조건이 있어야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '`export const loginSchema = z.object({ email: z.string().email("올바른 이메일 형식이 아닙니다."), password: z.string().min(8, "비밀번호는 최소 8자리 이상이어야 합니다.") });` 로 정의할 수 있습니다.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `"use client";
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  email: z.string().email({ message: '유효한 이메일을 입력하세요.' }),
  password: z.string().min(6, { message: '비밀번호는 최소 6자 이상이어야 합니다.' })
});

type FormData = z.infer<typeof schema>;

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const onSubmit = (data: FormData) => {
    console.log('Sending login data:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}
      <input {...register('password')} type="password" placeholder="Password" />
      {errors.password && <span>{errors.password.message}</span>}
      <button type="submit">Login</button>
    </form>
  );
}`
    }
  ]
}