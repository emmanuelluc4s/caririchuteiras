import * as Sentry from '@sentry/nextjs'

export function captureException(
  error: unknown,
  context?: Record<string, unknown>,
) {
  if (
    process.env.NODE_ENV !== 'production' ||
    !process.env.NEXT_PUBLIC_SENTRY_DSN
  ) {
    console.error('[sentry mock]', error, context)
    return
  }
  Sentry.captureException(error, { extra: context })
}

export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
) {
  if (
    process.env.NODE_ENV !== 'production' ||
    !process.env.NEXT_PUBLIC_SENTRY_DSN
  ) {
    console.log(`[sentry mock ${level}]`, message)
    return
  }
  Sentry.captureMessage(message, level)
}
