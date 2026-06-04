<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth'

const router = useRouter()
const isAuthChecking = ref(true)
const searchFilter = ref('')
const statusFilter = ref('SVE')

// --- PODACI O SVIM DOSTAVAMA (Admin pogled - kasnije vučeš iz DynamoDB scan/query rute) ---
const allDeliveries = ref([
  {
    id: 'DELIVERY#1717265230',
    user: 'Ivan Horvat',
    phone: '+385 91 234 5678',
    date: '12.06.2026.',
    city: 'Varaždin',
    address: 'Zagrebačka ulica 1',
    status: 'U_TRANZITU',
    price: 44.99,
    volume: 0.85,
    weight: 45.2,
    itemsCount: 4,
    isLocker: false
  },
  {
    id: 'DELIVERY#1717350000',
    user: 'Ana Marić',
    phone: '+385 95 888 1234',
    date: '13.06.2026.',
    city: 'Novi Marof',
    address: 'Varaždinska 42',
    status: 'ČEKA PRIKUP',
    price: 6.99,
    volume: 0.12,
    weight: 14.5,
    itemsCount: 2,
    isLocker: true,
    lockerPin: '554321'
  },
  {
    id: 'DELIVERY#1714000000',
    user: 'Marko Tomić',
    phone: '+385 99 777 9999',
    date: '25.04.2026.',
    city: 'Varaždin',
    address: 'Kapucinski trg 5',
    status: 'DOSTAVLJENO',
    price: 69.98,
    volume: 1.60,
    weight: 112.0,
    itemsCount: 15,
    isLocker: false
  }
])

// --- OPCIJE STATUSA ZA FILTRIRANJE I PROMJENU ---
const statusOptions = [
  { label: 'Zaprimljeno', value: 'ZAPRIMLJENO' },
  { label: 'U obradi', value: 'U_OBRADI' },
  { label: 'Čeka prikup (IKEA)', value: 'ČEKA PRIKUP' },
  { label: 'U tranzitu', value: 'U_TRANZITU' },
  { label: 'Dostavljeno', value: 'DOSTAVLJENO' }
]

// --- RAČUNANJE GLOBALNE STATISTIKE PANEL-A ---
const stats = computed(() => {
  const active = allDeliveries.value.filter(d => d.status !== 'DOSTAVLJENO').length
  const revenue = allDeliveries.value.reduce((sum, d) => sum + d.price, 0)
  const volume = allDeliveries.value.reduce((sum, d) => sum + d.volume, 0)
  return { active, revenue, volume: Number(volume.toFixed(2)) }
})

// --- FILTRIRANJE DOSTAVA NA EKRANU ---
const filteredDeliveries = computed(() => {
  return allDeliveries.value.filter(d => {
    const matchesSearch = d.user.toLowerCase().includes(searchFilter.value.toLowerCase()) ||
      d.id.toLowerCase().includes(searchFilter.value.toLowerCase()) ||
      d.city.toLowerCase().includes(searchFilter.value.toLowerCase())

    const matchesStatus = statusFilter.value === 'SVE' || d.status === statusFilter.value

    return matchesSearch && matchesStatus
  })
})

// --- PROMJENA STATUSA DOSTAVE (Ovdje okidaš AWS API za update baze) ---
function updateStatus(deliveryId: string, newStatus: string) {
  const target = allDeliveries.value.find(d => d.id === deliveryId)
  if (target) {
    target.status = newStatus
    // Ovdje u produkciji radiš: await $fetch(`/api/admin/update-status`, { method: 'POST', body: { id: deliveryId, status: newStatus } })
    alert(`Status dostave ${deliveryId} uspješno promijenjen u: ${newStatus}`)
  }
}

// --- ZAŠTITA STRANICE (Samo ulogirani admini, za MVP provjeravamo sesiju) ---
onMounted(async () => {
  try {
    await getCurrentUser()
    // Ovdje kasnije provjeravaš u attributes je li email tvoj admin email ili Cognito grupa "Admin"
  } catch (error) {
    console.warn('Neautoriziran pristup admin panelu, preusmjeravanje...')
    router.push('/login')
  } finally {
    isAuthChecking.value = false
  }
})

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('hr-HR', { style: 'currency', currency: 'EUR' }).format(price)
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 font-sans text-neutral-900 pb-20">

    <div v-if="isAuthChecking" class="fixed inset-0 bg-gray-100 z-50 flex items-center justify-center">
      <div class="flex flex-col items-center gap-4">
        <UIcon name="i-lucide-loader-2" class="w-10 h-10 text-yellow-500 animate-spin" />
        <p class="text-sm font-bold text-gray-500 uppercase tracking-widest">Provjera ovlasti...</p>
      </div>
    </div>

    <template v-else>
      <header class="bg-gray-900 text-white sticky top-0 z-40 shadow-md w-full">
        <div class="w-full max-w-[1400px] mx-auto flex items-center justify-between py-4 px-4 sm:px-6 lg:px-8">
          <div class="flex items-center gap-3">
            <span class="text-xl font-black tracking-wider">Usput<span class="text-yellow-400">.</span></span>
            <span class="bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">Admin Panel</span>
          </div>
          <UButton color="gray" variant="ghost" icon="i-lucide-home" to="/" class="text-gray-300 hover:text-white">
            Klijentski dio
          </UButton>
        </div>
      </header>

      <main class="pt-8 px-4 sm:px-6 lg:px-8">
        <div class="w-full max-w-[1400px] mx-auto space-y-8">

          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 class="text-3xl font-black text-gray-950">Upravljanje logistikom</h1>
              <p class="text-sm text-gray-500 mt-1">Pregled i kontrola ruta, paketomata i statusa dostava u realnom vremenu.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full">
            <UCard class="shadow-sm border border-gray-200 bg-white rounded-2xl w-full">
              <div class="p-5 flex items-center justify-between">
                <div>
                  <span class="text-xs font-bold text-gray-400 uppercase tracking-wider block">Aktivne dostave</span>
                  <div class="text-3xl font-black text-gray-900 mt-1">{{ stats.active }}</div>
                </div>
                <div class="p-3 bg-amber-100 text-amber-700 rounded-xl"><UIcon name="i-lucide-truck" class="w-6 h-6" /></div>
              </div>
            </UCard>

            <UCard class="shadow-sm border border-gray-200 bg-white rounded-2xl w-full">
              <div class="p-5 flex items-center justify-between">
                <div>
                  <span class="text-xs font-bold text-gray-400 uppercase tracking-wider block">Ukupni promet (Gross)</span>
                  <div class="text-3xl font-black text-green-600 mt-1">{{ formatPrice(stats.revenue) }}</div>
                </div>
                <div class="p-3 bg-green-100 text-green-700 rounded-xl"><UIcon name="i-lucide-banknote" class="w-6 h-6" /></div>
              </div>
            </UCard>

            <UCard class="shadow-sm border border-gray-200 bg-white rounded-2xl w-full">
              <div class="p-5 flex items-center justify-between">
                <div>
                  <span class="text-xs font-bold text-gray-400 uppercase tracking-wider block">Ukupni volumen u tranzitu</span>
                  <div class="text-3xl font-black text-blue-600 mt-1">{{ stats.volume }} m³</div>
                </div>
                <div class="p-3 bg-blue-100 text-blue-700 rounded-xl"><UIcon name="i-lucide-box" class="w-6 h-6" /></div>
              </div>
            </UCard>
          </div>

          <div class="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row gap-4 items-center w-full shadow-sm">
            <div class="flex-1 w-full">
              <UInput v-model="searchFilter" icon="i-lucide-search" placeholder="Pretraži po imenu klijenta, ID-u ili gradu..." size="lg" class="w-full" />
            </div>
            <div class="w-full sm:w-64">
              <USelect v-model="statusFilter" :options="[{ label: 'Svi statusi', value: 'SVE' }, ...statusOptions]" size="lg" class="w-full" />
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden w-full">
            <div class="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h3 class="font-bold text-gray-800 text-sm uppercase tracking-wider">Popis zahtjeva ({{ filteredDeliveries.length }})</h3>
            </div>

            <div class="divide-y divide-gray-200 w-full overflow-x-auto">
              <div v-if="filteredDeliveries.length === 0" class="p-12 text-center text-gray-400 font-medium">
                Nije pronađena nijedna dostava prema zadanim kriterijima.
              </div>

              <div v-else v-for="del in filteredDeliveries" :key="del.id" class="p-6 hover:bg-gray-50/50 transition-colors w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">

                <div class="lg:col-span-2 min-w-0">
                  <span class="font-mono text-xs font-bold text-gray-400 block mb-1">ID DOSTAVE</span>
                  <NuxtLink :to="`/delivery/${del.id.split('#')[1]}`" class="font-mono text-sm font-black text-gray-900 hover:text-yellow-600 underline truncate block">
                    {{ del.id.split('#')[1] }}
                  </NuxtLink>
                  <span class="text-xs text-gray-500 font-medium block mt-1">{{ del.date }}</span>
                </div>

                <div class="lg:col-span-3 min-w-0">
                  <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Primatelj i adresa</span>
                  <p class="font-bold text-gray-900 text-sm truncate">{{ del.user }}</p>
                  <p class="text-xs text-gray-600 mt-0.5 truncate flex items-center gap-1">
                    <UIcon name="i-lucide-map-pin" class="w-3.5 h-3.5 text-gray-400" />
                    {{ del.address }}, {{ del.city }}
                  </p>
                  <p class="text-[11px] font-mono text-gray-500 mt-1">{{ del.phone }}</p>
                </div>

                <div class="lg:col-span-2">
                  <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Specifikacija</span>
                  <div class="flex flex-wrap gap-1.5 mt-1">
                    <UBadge color="gray" variant="solid" size="xs" class="font-bold">{{ del.itemsCount }} kom</UBadge>
                    <UBadge color="gray" variant="solid" size="xs" class="font-bold">{{ del.volume }} m³</UBadge>
                    <UBadge color="gray" variant="solid" size="xs" class="font-bold">{{ del.weight }} kg</UBadge>
                  </div>
                  <div v-if="del.isLocker" class="mt-2 flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 max-w-max">
                    <UIcon name="i-lucide-key" class="w-3 h-3" /> PIN: {{ del.lockerPin }}
                  </div>
                </div>

                <div class="lg:col-span-1">
                  <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Cijena</span>
                  <span class="text-base font-black text-gray-900 block">{{ formatPrice(del.price) }}</span>
                </div>

                <div class="lg:col-span-2">
                  <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Trenutni Status</span>
                  <UBadge
                    :color="del.status === 'DOSTAVLJENO' ? 'green' : 'amber'"
                    variant="subtle"
                    class="font-black text-[10px] tracking-wider mt-1 px-2.5 py-1 rounded-md"
                  >
                    {{ del.status.replace('_', ' ') }}
                  </UBadge>
                </div>

                <div class="lg:col-span-2 w-full">
                  <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Upravljanje statusom</span>
                  <USelect
                    :model-value="del.status"
                    :options="statusOptions"
                    size="sm"
                    class="w-full"
                    @update:model-value="(val) => updateStatus(del.id, val)"
                  />

                  <UButton
                    size="xs"
                    color="gray"
                    variant="ghost"
                    icon="i-lucide-external-link"
                    :to="`/tracking/${del.id.split('#')[1]}`"
                    class="mt-2 text-gray-500 font-bold hover:text-black w-full justify-start pl-1"
                  >
                    Otvori javni tracking
                  </UButton>
                </div>

              </div>
            </div>
          </div>

        </div>
      </main>
    </template>
  </div>
</template>
