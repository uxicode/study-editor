import type { FileTemplate } from '@/types/curriculum'

/**
 * 9주차(로그인 및 고급 인증) 스텝들이 공유하는 읽기 전용 파일.
 * 앞 스텝에서 학습자가 완성한 코드의 "정답 버전"을 다음 스텝의 의존성으로 제공한다.
 */

export const AUTH_CONFIG_FILE: FileTemplate = {
  name: 'auth-config.ts',
  path: 'lib/auth-config.ts',
  readonly: true,
  language: 'typescript',
  content: `export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';
export const ACCESS_TOKEN_TTL_SEC = 60 * 15;          // 15분
export const REFRESH_TOKEN_TTL_SEC = 60 * 60 * 24 * 7; // 7일
export const REFRESH_TOKEN_PATH = '/api/auth/refresh';

/**
 * 비밀키는 코드에 쓰지 않고 환경 변수에서만 읽는다.
 * 생성 예) openssl rand -base64 32
 */
export function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET 환경 변수(32자 이상)가 설정되지 않았습니다.');
  }
  return new TextEncoder().encode(secret);
}
`
}

export const USERS_FILE: FileTemplate = {
  name: 'users.ts',
  path: 'lib/users.ts',
  readonly: true,
  language: 'typescript',
  content: `export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string; // bcrypt 해시만 저장한다. 평문 컬럼은 존재하지 않는다.
  role: 'USER' | 'ADMIN';
}

/**
 * 사용자가 없을 때도 bcrypt.compare 를 실행해 응답 시간을 맞추기 위한 더미 해시.
 * 어떤 비밀번호와도 일치하지 않는 무작위 값의 해시이며, 실서비스에서는 서버 시작 시
 * bcrypt.hash(crypto.randomUUID(), SALT_ROUNDS) 로 생성해도 된다.
 */
export const DUMMY_PASSWORD_HASH = '$2b$12$C6UzMDM.H6dfI/f/IKcEeO5x9pXc1sL6RkQ0p5gYb3vF8m2Jt4Hqa';

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  // 실제로는 DB 조회: SELECT id, email, password_hash, role FROM users WHERE email = ?
  return null;
}
`
}

export const PASSWORD_FILE: FileTemplate = {
  name: 'password.ts',
  path: 'lib/password.ts',
  readonly: true,
  language: 'typescript',
  content: `import bcrypt from 'bcryptjs';

export const SALT_ROUNDS = 12;
export const MAX_PASSWORD_BYTES = 72;

export function assertPasswordLength(plain: string): void {
  if (new TextEncoder().encode(plain).length > MAX_PASSWORD_BYTES) {
    throw new Error('비밀번호는 UTF-8 기준 72바이트 이하여야 합니다.');
  }
}

export async function hashPassword(plain: string): Promise<string> {
  assertPasswordLength(plain);
  return await bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  assertPasswordLength(plain);
  return await bcrypt.compare(plain, hash);
}
`
}

export const LOGIN_SCHEMA_FILE: FileTemplate = {
  name: 'loginSchema.ts',
  path: 'schemas/loginSchema.ts',
  readonly: true,
  language: 'typescript',
  content: `import { z } from 'zod';

const MAX_PASSWORD_BYTES = 72;

/** 클라이언트(폼)와 서버(Route Handler)가 함께 쓰는 로그인 입력 스키마 */
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('올바른 이메일 형식이 아닙니다.'),
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다.')
    .refine(
      (value) => new TextEncoder().encode(value).length <= MAX_PASSWORD_BYTES,
      '비밀번호가 너무 깁니다.'
    )
});

export type LoginInput = z.infer<typeof loginSchema>;
`
}

export const LOGIN_FORM_HOOK_FILE: FileTemplate = {
  name: 'useLoginForm.ts',
  path: 'hooks/useLoginForm.ts',
  readonly: true,
  language: 'typescript',
  content: `'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/schemas/loginSchema';
import type { AuthUser } from '@/stores/authStore';

interface LoginResponse {
  user: AuthUser;
}

export function useLoginForm(onSuccess: (user: AuthUser) => void) {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    });

    if (res.status === 401) {
      form.setError('root', { message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
      form.resetField('password');
      return;
    }
    if (!res.ok) {
      form.setError('root', { message: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' });
      return;
    }

    const data: LoginResponse = await res.json();
    onSuccess(data.user);
  });

  return { form, onSubmit };
}
`
}

export const AUTH_STORE_FILE: FileTemplate = {
  name: 'authStore.ts',
  path: 'stores/authStore.ts',
  readonly: true,
  language: 'typescript',
  content: `import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
}

/**
 * 화면 표시용 사용자 정보만 보관한다.
 * 토큰은 HttpOnly 쿠키에 있으므로 스토어·localStorage 에 저장하지 않는다.
 */
interface AuthState {
  user: AuthUser | null;
  setUser: (user: AuthUser) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null })
}));
`
}

export const SESSIONS_FILE: FileTemplate = {
  name: 'sessions.ts',
  path: 'lib/sessions.ts',
  readonly: true,
  language: 'typescript',
  content: `/**
 * Refresh Token 저장소 (실제로는 DB 테이블 refresh_tokens).
 * 토큰 원문이 아니라 SHA-256 해시를 저장해, DB 가 유출되어도 바로 쓸 수 없게 한다.
 */
export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  // UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = sha256(?)
}
`
}
