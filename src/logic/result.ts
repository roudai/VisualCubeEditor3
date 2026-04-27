import type { LogicError } from './types.js'

export type Result<T, E = LogicError> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E }

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value })

export const err = <E = LogicError>(error: E): Result<never, E> => ({ ok: false, error })
