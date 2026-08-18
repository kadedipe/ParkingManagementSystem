module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...(config.extra || {}),
    API_URL: process.env.EXPO_PUBLIC_API_URL || config.extra?.API_URL,
    WS_URL: process.env.EXPO_PUBLIC_WS_URL || config.extra?.WS_URL,
    env: process.env.EXPO_PUBLIC_ENV || config.extra?.env || 'development',
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || config.extra?.GOOGLE_MAPS_API_KEY || '',
    stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || config.extra?.STRIPE_PUBLISHABLE_KEY || '',
    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN || config.extra?.SENTRY_DSN || '',
    mixpanelToken: process.env.EXPO_PUBLIC_MIXPANEL_TOKEN || config.extra?.MIXPANEL_TOKEN || '',
  },
});
