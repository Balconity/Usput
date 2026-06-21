import { defineEventHandler, readBody, setResponseStatus } from 'h3'

const config = useRuntimeConfig()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const listUrl = body?.url

    if (!listUrl || !listUrl.includes('ikea.com')) {
      setResponseStatus(event, 400)
      return { success: false, error: 'Molimo unesite ispravnu IKEA poveznicu.' }
    }

    // OVDJE KORISTIMO VARIJABLU IZ RUNTIMECONFIG-A:
    const ec2ApiUrl = config.apiUrl

    const response = await $fetch(ec2ApiUrl, {
      method: 'POST',
      body: { url: listUrl },
      timeout: 60000
    })

    return response

  } catch (error: any) {
    console.error('Greška pri komunikaciji s EC2 serverom:', error.message)
    setResponseStatus(event, 500)
    return { success: false, error: 'Sustav za izračun volumena trenutno nije dostupan.' }
  }
})
