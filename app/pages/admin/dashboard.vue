<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser } from 'aws-amplify/auth'

const router = useRouter()
const isAuthChecking = ref(true)

// --- VARIJABLE FILTERA ---
const searchFilter = ref('')
const statusFilter = ref('SVE')
const dateFilter = ref('SVE')

// --- POSTAVKE KOMBIJA (Trajno pamćenje u LocalStorage) ---
const vanVolumeCapacity = ref(12.0)
const vanWeightCapacity = ref(1300)

watch(vanVolumeCapacity, (newVal) => localStorage.setItem('usput_van_vol', newVal.toString()))
watch(vanWeightCapacity, (newVal) => localStorage.setItem('usput_van_weight', newVal.toString()))

// --- PODACI O SVIM DOSTAVAMA ---
const allDeliveries = ref([
  {
    id: 'DELIVERY#1717265230',
    user: 'Ivan Horvat',
    phone: '+385 91 234 5678',
    date: '12.06.2026.',
    city: 'Varaždin',
    address: 'Zagrebačka ulica 1',
    status: 'ZAPRIMLJENO',
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
    date: '12.06.2026.',
    city: 'Novi Marof',
    address: 'Varaždinska 42',
    status: 'ZAPRIMLJENO',
    price: 6.99,
    volume: 8.12,
    weight: 414.5,
    itemsCount: 12,
    isLocker: true,
    lockerPin: '554321'
  },
  {
    id: 'DELIVERY#1714000000',
    user: 'Marko Tomić',
    phone: '+385 99 777 9999',
    date: '12.06.2026.',
    city: 'Varaždin',
    address: 'Kapucinski trg 5',
    status: 'ZAPRIMLJENO',
    price: 69.98,
    volume: 3.60,
    weight: 112.0,
    itemsCount: 15,
    isLocker: false
  }
])

// --- JEDINSTVENI DATUMI (Čisti stringovi za nativni select) ---
const availableDates = computed(() => {
  return [...new Set(allDeliveries.value.map(d => d.date))].sort()
})

// --- STATISTIKA ---
const stats = computed(() => {
  const active = allDeliveries.value.filter(d => d.status !== 'DOSTAVLJENO').length
  const revenue = allDeliveries.value.reduce((sum, d) => sum + d.price, 0)
  const volume = allDeliveries.value.reduce((sum, d) => sum + d.volume, 0)
  return { active, revenue, volume: Number(volume.toFixed(2)) }
})

// --- FILTRIRANJE NA EKRANU ---
const filteredDeliveries = computed(() => {
  return allDeliveries.value.filter(d => {
    const matchesSearch = d.user.toLowerCase().includes(searchFilter.value.toLowerCase()) ||
      d.id.toLowerCase().includes(searchFilter.value.toLowerCase()) ||
      d.city.toLowerCase().includes(searchFilter.value.toLowerCase())

    const matchesStatus = statusFilter.value === 'SVE' || d.status === statusFilter.value
    const matchesDate = dateFilter.value === 'SVE' || d.date === dateFilter.value

    return matchesSearch && matchesStatus && matchesDate
  })
})

// --- KAPACITET KOMBIJA ---
const activeLoad = computed(() => {
  if (dateFilter.value === 'SVE') return null

  const activeOrders = filteredDeliveries.value.filter(d => d.status !== 'DOSTAVLJENO' && d.status !== 'OTKAZANO')
  const usedVolume = activeOrders.reduce((sum, d) => sum + d.volume, 0)
  const usedWeight = activeOrders.reduce((sum, d) => sum + d.weight, 0)

  const volPct = (usedVolume / vanVolumeCapacity.value) * 100
  const weightPct = (usedWeight / vanWeightCapacity.value) * 100

  return {
    usedVolume,
    usedWeight,
    remVolume: Math.max(0, vanVolumeCapacity.value - usedVolume),
    remWeight: Math.max(0, vanWeightCapacity.value - usedWeight),
    volPct: volPct > 100 ? 100 : Math.round(volPct),
    weightPct: weightPct > 100 ? 100 : Math.round(weightPct)
  }
})

// --- FUNKCIJE ZA AKCIJE ---
function updateStatus(deliveryId: string, event: Event) {
  const selectElement = event.target as HTMLSelectElement
  const newStatusValue = selectElement.value

  const target = allDeliveries.value.find(d => d.id === deliveryId)
  if (target) {
    target.status = newStatusValue
  }
}

function postponeToNextDay(deliveryId: string) {
  const target = allDeliveries.value.find(d => d.id === deliveryId)
  if (!target) return

  const parts = target.date.split('.')
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const year = parseInt(parts[2], 10)

    const dateObj = new Date(year, month, day)
    dateObj.setDate(dateObj.getDate() + 1)

    const nextDay = String(dateObj.getDate()).padStart(2, '0')
    const nextMonth = String(dateObj.getMonth() + 1).padStart(2, '0')
    const nextYear = dateObj.getFullYear()

    target.date = `${nextDay}.${nextMonth}.${nextYear}.`
    alert(`Dostava prebačena na ${target.date}`)
  }
}

onMounted(async () => {
  const savedVol = localStorage.getItem('usput_van_vol')
  if (savedVol) vanVolumeCapacity.value = parseFloat(savedVol)

  const savedWeight = localStorage.getItem('usput_van_weight')
  if (savedWeight) vanWeightCapacity.value = parseInt(savedWeight)

  try {
    await getCurrentUser()
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
              <p class="text-sm text-gray-500 mt-1">Pregled rute i optimizacija tereta vozila.</p>
            </div>

            <div class="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm items-center">
              <span class="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <UIcon name="i-lucide-truck" class="w-4 h-4" /> Moje vozilo:
              </span>
              <div class="flex gap-2">
                <UFormGroup label="Kapacitet (m³)">
                  <UInput v-model.number="vanVolumeCapacity" type="number" step="0.5" class="w-24" size="sm" />
                </UFormGroup>
                <UFormGroup label="Nosivost (kg)">
                  <UInput v-model.number="vanWeightCapacity" type="number" step="50" class="w-24" size="sm" />
                </UFormGroup>
              </div>
            </div>
          </div>

          <div v-if="activeLoad" class="grid grid-cols-1 md:grid-cols-2 gap-5 w-full bg-white p-6 rounded-2xl border-2 border-blue-200 shadow-md relative overflow-hidden">
            <div class="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
            <div class="md:col-span-2 flex justify-between items-center">
              <div>
                <h3 class="text-xl font-black text-gray-900 flex items-center gap-2">
                  <UIcon name="i-lucide-route" class="w-6 h-6 text-blue-500" />
                  Optimizacija rute za dan: <span class="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{{ dateFilter }}</span>
                </h3>
              </div>
            </div>

            <div class="bg-gray-50 p-5 rounded-xl border border-gray-200 relative overflow-hidden">
              <div class="flex justify-between items-end mb-3">
                <span class="text-sm font-bold text-gray-500 uppercase tracking-wider">Popunjenost volumena</span>
                <span class="text-3xl font-black" :class="activeLoad.volPct > 95 ? 'text-red-500' : 'text-gray-900'">
                  {{ activeLoad.volPct }}%
                </span>
              </div>
              <UProgress :value="activeLoad.volPct" :color="activeLoad.volPct > 95 ? 'red' : 'yellow'" size="xl" />
              <div class="flex justify-between mt-3 text-xs font-bold">
                <span class="text-gray-600">Teret: {{ activeLoad.usedVolume.toFixed(2) }} / {{ vanVolumeCapacity }} m³</span>
                <span class="text-green-600 bg-green-50 px-2 py-1 rounded">Slobodno: {{ activeLoad.remVolume.toFixed(2) }} m³</span>
              </div>
            </div>

            <div class="bg-gray-50 p-5 rounded-xl border border-gray-200 relative overflow-hidden">
              <div class="flex justify-between items-end mb-3">
                <span class="text-sm font-bold text-gray-500 uppercase tracking-wider">Iskorištenost nosivosti</span>
                <span class="text-3xl font-black" :class="activeLoad.weightPct > 95 ? 'text-red-500' : 'text-gray-900'">
                  {{ activeLoad.weightPct }}%
                </span>
              </div>
              <UProgress :value="activeLoad.weightPct" :color="activeLoad.weightPct > 95 ? 'red' : 'blue'" size="xl" />
              <div class="flex justify-between mt-3 text-xs font-bold">
                <span class="text-gray-600">Masa: {{ activeLoad.usedWeight.toFixed(1) }} / {{ vanWeightCapacity }} kg</span>
                <span class="text-green-600 bg-green-50 px-2 py-1 rounded">Slobodno: {{ activeLoad.remWeight.toFixed(1) }} kg</span>
              </div>
            </div>

            <div v-if="activeLoad.volPct > 100 || activeLoad.weightPct > 100" class="md:col-span-2 mt-2 p-3 bg-red-50 text-red-700 text-sm font-bold rounded-lg border border-red-200 flex items-center gap-2">
              <UIcon name="i-lucide-alert-triangle" class="w-5 h-5" />
              UPOZORENJE: Prekoračili ste kapacitet vozila za ovaj datum! Molimo odgodite neku od narudžbi za idući dan.
            </div>
          </div>

          <div v-else class="bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-yellow-800 text-sm font-bold flex items-center gap-2 shadow-sm">
            <UIcon name="i-lucide-calendar-clock" class="w-5 h-5 shrink-0" />
            Za prikaz grafova popunjenosti kombija, u izborniku ispod odaberite konkretan datum planirane vožnje.
          </div>

          <div class="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col md:flex-row gap-4 items-center w-full shadow-sm">
            <div class="flex-1 w-full">
              <UInput v-model="searchFilter" icon="i-lucide-search" placeholder="Pretraži klijenta..." size="xl" class="w-full" />
            </div>

            <div class="w-full sm:w-64">
              <select
                v-model="dateFilter"
                class="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-yellow-500 text-sm bg-white shadow-sm cursor-pointer outline-none transition-all hover:ring-gray-400"
              >
                <option value="SVE">Svi datumi (Bez optimizacije)</option>
                <option v-for="date in availableDates" :key="date" :value="date">{{ date }}</option>
              </select>
            </div>

            <div class="w-full sm:w-56">
              <select
                v-model="statusFilter"
                class="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-yellow-500 text-sm bg-white shadow-sm cursor-pointer outline-none transition-all hover:ring-gray-400"
              >
                <option value="SVE">Svi statusi</option>
                <option value="ZAPRIMLJENO">Zaprimljeno (Aktivno)</option>
                <option value="U_OBRADI">U obradi</option>
                <option value="ČEKA PRIKUP">Čeka prikup (IKEA)</option>
                <option value="U_TRANZITU">U tranzitu</option>
                <option value="DOSTAVLJENO">Dostavljeno</option>
                <option value="OTKAZANO">Otkazano</option>
              </select>
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

              <div v-else v-for="del in filteredDeliveries" :key="del.id" class="p-6 hover:bg-gray-50/50 transition-colors w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center" :class="{'opacity-50 grayscale': del.status === 'DOSTAVLJENO' || del.status === 'OTKAZANO'}">

                <div class="lg:col-span-2 min-w-0">
                  <span class="font-mono text-xs font-bold text-gray-400 block mb-1">ID DOSTAVE</span>
                  <NuxtLink :to="`/tracking/${del.id.split('#')[1]}`" class="font-mono text-sm font-black text-gray-900 hover:text-yellow-600 underline truncate block">
                    {{ del.id.split('#')[1] }}
                  </NuxtLink>
                  <span class="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-flex items-center gap-1 mt-1">
                    <UIcon name="i-lucide-calendar" class="w-3.5 h-3.5" /> {{ del.date }}
                  </span>
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

                <div class="lg:col-span-3">
                  <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Teret i cijena</span>
                  <div class="flex flex-wrap gap-1.5 mt-1">
                    <UBadge color="gray" variant="solid" size="xs" class="font-bold">{{ del.itemsCount }} kom</UBadge>
                    <UBadge color="yellow" variant="soft" size="xs" class="font-bold">{{ del.volume }} m³</UBadge>
                    <UBadge color="blue" variant="soft" size="xs" class="font-bold">{{ del.weight }} kg</UBadge>
                  </div>
                  <span class="text-sm font-black text-green-600 block mt-2">{{ formatPrice(del.price) }}</span>
                </div>

                <div class="lg:col-span-4 flex flex-col gap-2 border-l border-gray-100 pl-4">
                  <div>
                    <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Status</span>
                    <select
                      :value="del.status"
                      @change="(e) => updateStatus(del.id, e)"
                      class="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-yellow-500 text-sm bg-white shadow-sm cursor-pointer outline-none transition-all hover:ring-gray-400"
                    >
                      <option value="ZAPRIMLJENO">Zaprimljeno (Aktivno)</option>
                      <option value="U_OBRADI">U obradi</option>
                      <option value="ČEKA PRIKUP">Čeka prikup (IKEA)</option>
                      <option value="U_TRANZITU">U tranzitu</option>
                      <option value="DOSTAVLJENO">Dostavljeno</option>
                      <option value="OTKAZANO">Otkazano</option>
                    </select>
                  </div>

                  <div class="flex items-center gap-2 mt-1">
                    <UButton
                      v-if="del.status !== 'DOSTAVLJENO' && del.status !== 'OTKAZANO'"
                      size="xs"
                      color="orange"
                      variant="soft"
                      icon="i-lucide-calendar-clock"
                      class="font-bold flex-1 justify-center"
                      @click="postponeToNextDay(del.id)"
                    >
                      Odgodi (+1 dan)
                    </UButton>

                    <UButton
                      size="xs"
                      color="gray"
                      variant="ghost"
                      icon="i-lucide-external-link"
                      :to="`/tracking/${del.id.split('#')[1]}`"
                      class="text-gray-500"
                      title="Otvori tracking link"
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </main>
    </template>
  </div>
</template>
