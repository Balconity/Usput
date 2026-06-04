<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser, fetchUserAttributes, signOut } from 'aws-amplify/auth'

const router = useRouter()

// --- STANJA UČITAVANJA ---
const isAuthChecking = ref(true)
const isLoggingOut = ref(false)

// --- PODACI KORISNIKA ---
const userProfile = ref({
  name: '',
  email: '',
  phone: ''
})

// --- MOCK PODACI (Ovo ćeš kasnije vući iz baze) ---
const userStats = ref({
  totalSpent: 114.97,
  totalDeliveries: 3,
  totalVolume: 2.45
})

const myOrders = ref([
  {
    id: 'ORDER#1717265230',
    date: '12. lipnja 2026.',
    status: 'ČEKA PRIKUP',
    price: 44.99,
    volume: 0.85,
    weight: 45.2,
    address: 'Zagrebačka ulica 1, Varaždin',
    itemsCount: 4
  },
  {
    id: 'ORDER#1714000000',
    date: '25. travnja 2026.',
    status: 'DOSTAVLJENO',
    price: 69.98,
    volume: 1.60,
    weight: 112.0,
    address: 'Zagrebačka ulica 1, Varaždin',
    itemsCount: 15
  }
])

// --- LOGIKA ---
onMounted(async () => {
  try {
    await getCurrentUser()
    const attributes = await fetchUserAttributes()
    userProfile.value = {
      name: attributes.name || 'Korisnik',
      email: attributes.email || '',
      phone: attributes.phone_number || ''
    }
  } catch (error) {
    console.warn('Korisnik nije prijavljen, preusmjeravanje na login...')
    router.push('/login')
  } finally {
    isAuthChecking.value = false
  }
})

async function handleLogout() {
  isLoggingOut.value = true
  try {
    await signOut()
    router.push('/')
  } catch (error) {
    console.error('Greška pri odjavi:', error)
    isLoggingOut.value = false
  }
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('hr-HR', { style: 'currency', currency: 'EUR' }).format(price)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans text-neutral-900 pb-20">

    <div v-if="isAuthChecking" class="fixed inset-0 bg-gray-50 z-50 flex items-center justify-center">
      <div class="flex flex-col items-center gap-4">
        <UIcon name="i-lucide-loader-2" class="w-10 h-10 text-yellow-500 animate-spin" />
        <p class="text-sm font-bold text-gray-500 uppercase tracking-widest">Učitavanje profila...</p>
      </div>
    </div>

    <template v-else>
      <header class="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm w-full">
        <div class="w-full max-w-[1400px] mx-auto flex items-center justify-between py-4 px-4 sm:px-6 lg:px-8">
          <NuxtLink to="/" class="flex items-center gap-2 text-xl font-bold hover:opacity-80 transition-opacity">
            <span>Usput<span class="text-yellow-500">.</span></span>
          </NuxtLink>
          <div class="flex items-center gap-4">
            <UButton
              color="gray"
              variant="ghost"
              icon="i-lucide-log-out"
              :loading="isLoggingOut"
              @click="handleLogout"
            >
              Odjavi se
            </UButton>
          </div>
        </div>
      </header>

      <main class="pt-8 px-4 sm:px-6 lg:px-8">
        <div class="w-full max-w-[1400px] mx-auto">

          <div class="mb-8">
            <h1 class="text-3xl font-extrabold text-gray-900 mb-2">Bok, {{ userProfile.name.split(' ')[0] }}! 👋</h1>
            <p class="text-gray-600">Dobrodošli u svoj osobni kontrolni centar za dostave.</p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">

            <div class="lg:col-span-4 space-y-6 w-full">

              <UCard class="shadow-sm border border-gray-200/60 rounded-2xl bg-white overflow-hidden w-full" :ui="{ body: { padding: 'p-0' } }">
                <div class="p-6">
                  <div class="flex items-center gap-4 mb-6">
                    <div class="w-14 h-14 bg-gray-900 text-yellow-400 rounded-full flex items-center justify-center font-bold text-2xl shrink-0">
                      {{ userProfile.name.charAt(0).toUpperCase() }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <h2 class="text-lg font-bold text-gray-900 truncate">{{ userProfile.name }}</h2>
                      <div class="flex items-center gap-1.5 mt-0.5">
                        <UIcon name="i-lucide-badge-check" class="w-4 h-4 text-green-600 shrink-0" />
                        <span class="text-xs font-bold text-green-600 tracking-wide uppercase">Verificiran korisnik</span>
                      </div>
                    </div>
                  </div>

                  <div class="space-y-4 w-full">
                    <div>
                      <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Email adresa</span>
                      <div class="bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 flex items-center gap-3 w-full">
                        <UIcon name="i-lucide-mail" class="w-5 h-5 text-gray-400 shrink-0" />
                        <span class="text-sm font-semibold text-gray-800 truncate flex-1 min-w-0">{{ userProfile.email }}</span>
                      </div>
                    </div>

                    <div>
                      <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Broj telefona</span>
                      <div class="bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 flex items-center gap-3 w-full">
                        <UIcon name="i-lucide-phone" class="w-5 h-5 text-gray-400 shrink-0" />
                        <span class="text-sm font-semibold text-gray-800 flex-1">{{ userProfile.phone }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="p-4 bg-gray-50 border-t border-gray-100">
                  <UButton block color="gray" variant="ghost" icon="i-lucide-settings" class="font-semibold hover:bg-gray-200 w-full justify-center">
                    Uredi podatke profila
                  </UButton>
                </div>
              </UCard>

              <UCard class="shadow-sm border border-yellow-200 rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50 w-full">
                <div class="p-6 text-center">
                  <div class="w-12 h-12 bg-yellow-400 text-black rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
                    <UIcon name="i-lucide-gift" class="w-6 h-6" />
                  </div>
                  <h3 class="font-bold text-gray-900 mb-1">Pokloni 10€, dobij 10€!</h3>
                  <p class="text-xs text-gray-600 mb-4 leading-relaxed">
                    Podijeli svoj kod s prijateljima. Oni dobivaju popust na prvu dostavu, a ti na iduću!
                  </p>
                  <div class="bg-white border-2 border-dashed border-yellow-400 py-3 px-4 rounded-xl flex justify-between items-center cursor-pointer hover:bg-yellow-100/50 transition-colors" title="Kopiraj kod">
                    <span class="font-mono font-bold text-base text-gray-900 tracking-wider">USPUT-{{ userProfile.name.substring(0,3).toUpperCase() }}</span>
                    <UIcon name="i-lucide-copy" class="w-4 h-4 text-yellow-600 shrink-0" />
                  </div>
                </div>
              </UCard>
            </div>


            <div class="lg:col-span-8 space-y-6 w-full">

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                <UCard class="shadow-sm border border-gray-200/60 rounded-2xl bg-white w-full">
                  <div class="p-5">
                    <div class="flex items-center gap-3 mb-2">
                      <div class="p-2 bg-green-100 text-green-700 rounded-lg shrink-0"><UIcon name="i-lucide-wallet" class="w-5 h-5" /></div>
                      <span class="text-xs font-bold text-gray-400 uppercase tracking-wide">Ukupno plaćeno</span>
                    </div>
                    <div class="text-2xl font-black text-gray-900 mt-1">{{ formatPrice(userStats.totalSpent) }}</div>
                  </div>
                </UCard>

                <UCard class="shadow-sm border border-gray-200/60 rounded-2xl bg-white w-full">
                  <div class="p-5">
                    <div class="flex items-center gap-3 mb-2">
                      <div class="p-2 bg-blue-100 text-blue-700 rounded-lg shrink-0"><UIcon name="i-lucide-truck" class="w-5 h-5" /></div>
                      <span class="text-xs font-bold text-gray-400 uppercase tracking-wide">Dostave</span>
                    </div>
                    <div class="text-2xl font-black text-gray-900 mt-1">{{ userStats.totalDeliveries }} <span class="text-sm text-gray-400 font-bold uppercase ml-0.5">Pošiljke</span></div>
                  </div>
                </UCard>

                <UCard class="shadow-sm border border-gray-200/60 rounded-2xl bg-white w-full">
                  <div class="p-5">
                    <div class="flex items-center gap-3 mb-2">
                      <div class="p-2 bg-yellow-100 text-yellow-700 rounded-lg shrink-0"><UIcon name="i-lucide-box" class="w-5 h-5" /></div>
                      <span class="text-xs font-bold text-gray-400 uppercase tracking-wide">Ukupni volumen</span>
                    </div>
                    <div class="text-2xl font-black text-gray-900 mt-1">{{ userStats.totalVolume }} <span class="text-sm text-gray-400 font-bold uppercase ml-0.5">m³</span></div>
                  </div>
                </UCard>
              </div>

              <UCard class="shadow-sm border border-gray-200/60 rounded-2xl bg-white w-full">

                <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70 rounded-t-2xl w-full">
                  <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
                    <UIcon name="i-lucide-clock" class="w-5 h-5 text-yellow-500 shrink-0" />
                    Povijest vaših dostava
                  </h3>
                  <UButton size="sm" color="gray" variant="solid" icon="i-lucide-plus" to="/#contact" class="shadow-sm font-bold">
                    Nova narudžba
                  </UButton>
                </div>

                <div class="p-6 w-full">

                  <div v-if="myOrders.length === 0" class="text-center py-12">
                    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-50">
                      <UIcon name="i-lucide-receipt" class="w-7 h-7 text-gray-400" />
                    </div>
                    <h4 class="text-lg font-bold text-gray-900 mb-1">Nema evidentiranih narudžbi</h4>
                    <p class="text-gray-500 text-sm mb-6">Ovdje će se prikazivati sve vaše aktivne i prošle dostave.</p>
                  </div>

                  <div v-else class="space-y-5 w-full">
                    <div
                      v-for="order in myOrders"
                      :key="order.id"
                      class="border border-gray-200/80 rounded-2xl p-5 hover:border-yellow-400 hover:shadow-md transition-all bg-white w-full"
                    >
                      <div class="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100 w-full">
                        <div class="flex items-center gap-3">
                          <span class="font-mono text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded">{{ order.id }}</span>
                          <UBadge
                            :color="order.status === 'DOSTAVLJENO' ? 'green' : 'amber'"
                            variant="subtle"
                            class="font-bold tracking-wider text-[10px]"
                          >
                            {{ order.status }}
                          </UBadge>
                        </div>
                        <div class="text-xl font-black text-gray-900">
                          {{ formatPrice(order.price) }}
                        </div>
                      </div>

                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 w-full">
                        <div>
                          <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Datum kreiranja</span>
                          <p class="text-sm font-semibold text-gray-800 flex items-center gap-2">
                            <UIcon name="i-lucide-calendar" class="w-4 h-4 text-gray-400 shrink-0" />
                            {{ order.date }}
                          </p>
                        </div>
                        <div class="min-w-0">
                          <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Adresa isporuke</span>
                          <p class="text-sm font-semibold text-gray-800 flex items-center gap-2 w-full min-w-0">
                            <UIcon name="i-lucide-map-pin" class="w-4 h-4 text-gray-400 shrink-0" />
                            <span class="truncate flex-1 min-w-0" :title="order.address">{{ order.address }}</span>
                          </p>
                        </div>
                      </div>

                      <div class="flex flex-wrap gap-3 pt-2">
                        <div class="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 flex items-center gap-2 shadow-sm">
                          <UIcon name="i-lucide-layers" class="w-4 h-4 text-yellow-500 shrink-0" />
                          {{ order.itemsCount }} artikala
                        </div>
                        <div class="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 flex items-center gap-2 shadow-sm">
                          <UIcon name="i-lucide-box" class="w-4 h-4 text-yellow-500 shrink-0" />
                          {{ order.volume }} m³
                        </div>
                        <div class="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 flex items-center gap-2 shadow-sm">
                          <UIcon name="i-lucide-scale" class="w-4 h-4 text-yellow-500 shrink-0" />
                          {{ order.weight }} kg
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              </UCard>
            </div>

          </div>
        </div>
      </main>

    </template>
  </div>
</template>
