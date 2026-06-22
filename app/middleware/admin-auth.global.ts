export default defineNuxtRouteMiddleware((to) => {
  // useCookie mora imati iste opcije (path) kao i kod postavljanja
  const authCookie = useCookie('admin_authenticated', { path: '/' })

  // Ako idemo na admin rute
  if (to.path.startsWith('/admin')) {

    // Ako idemo na login stranicu
    if (to.path === '/admin/login') {
      // Ako je kolačić već postavljen i točan, baci nas na dashboard
      if (authCookie.value === 'true' || authCookie.value === true) {
        return navigateTo('/admin/dashboard')
      }
      return
    }

    // Stroga provjera: ako kolačić NIJE 'true' (tekst) i NIJE true (boolean)
    if (authCookie.value !== 'true' && authCookie.value !== true) {
      // Zapamti kamo smo krenuli i šalji na login
      return navigateTo(`/admin/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }
  }
})
