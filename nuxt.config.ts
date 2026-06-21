export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    'nuxt-security'
  ],

  colorMode: {
    preference: 'light'
  },

  runtimeConfig: {
    apiUrl: process.env.API_URL,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    awsAccessKey: process.env.ACCESS_KEY_ID,
    awsSecretKey: process.env.SECRET_ACCESS_KEY,

    public: {

    }
  },

  security: {
    rateLimiter: {
      tokensPerInterval: 150,
      interval: 60000,
      fireImmediately: true,
      throwError: true
    },
    headers: false,
  },

  routeRules: {
    '/api/**': {
      security: {
        rateLimiter: {
          tokensPerInterval: 150,
          interval: 60000
        }
      }
    }
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2025-01-15',

  nitro: {
    preset: 'aws-amplify'
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
