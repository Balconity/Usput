export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const expectedUser = config.adminUsername || 'admin'
  const expectedPass = config.adminPassword || 'admin'

  if (body.username === expectedUser && body.password === expectedPass) {
    // Postavljamo kolačić s točnim opcijama za Nuxt SSR
    setCookie(event, 'admin_authenticated', 'true', {
      maxAge: 60 * 60 * 24 * 7, // 1 tjedan
      path: '/',                // Dostupno na cijeloj domeni
      httpOnly: false,          // Omogućuje frontendu da vidi kolačić tijekom hidracije
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    return { success: true }
  }

  throw createError({
    statusCode: 401,
    statusMessage: 'Pogrešno korisničko ime ili lozinka.'
  })
})
