import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.0,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  beforeSend(event) {
    if (event.request?.cookies) {
      delete event.request.cookies
    }
    return event
  },
  environment: process.env.NODE_ENV,
  enabled:
    process.env.NODE_ENV === 'production' &&
    Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
})
