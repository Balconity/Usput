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

    public: {

    }
  },

  security: {
    rateLimiter: {
      tokensPerInterval: 5,
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
          tokensPerInterval: 5,
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
