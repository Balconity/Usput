// plugins/amplify.client.ts
import { defineNuxtPlugin } from '#app'
import { Amplify } from 'aws-amplify'

export default defineNuxtPlugin(() => {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: 'eu-central-1_Ia2GDg1pb',
        userPoolClientId: '4g9rg1npoc1a00bqnt8mponls5',
      }
    }
  })
})
