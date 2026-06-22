<script setup lang="ts">
import { computed, ref } from 'vue'

// --- 1. POSTOJEĆA LOGIKA ZA NARUDŽBE ---
const { data, pending, error, refresh } = await useFetch('/api/admin/orders')

const formatDate = (isoString: string) => {
  if (!isoString) return ''
  return new Date(isoString).toLocaleDateString('hr-HR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const columns = [
  { id: 'id', key: 'id', label: 'ID Narudžbe', accessorKey: 'id', header: 'ID Narudžbe' },
  { id: 'createdAt', key: 'createdAt', label: 'Zatraženo', accessorKey: 'createdAt', header: 'Zatraženo' },
  { id: 'customer', key: 'customer', label: 'Kupac i Lokacija', accessorKey: 'customer', header: 'Kupac i Lokacija' },
  { id: 'pickupDate', key: 'pickupDate', label: 'Datum isporuke', accessorKey: 'pickupDate', header: 'Datum isporuke' },
  { id: 'status', key: 'status', label: 'Status', accessorKey: 'status', header: 'Status' },
  { id: 'actions', key: 'actions', label: 'Akcije', header: 'Akcije' }
]

const tableRows = computed(() => {
  if (!data.value || !data.value.orders) return []

  return data.value.orders.map((o: any) => ({
    rawId: o?.PK ? o.PK.replace('ORDER#', '') : 'nepoznato',
    id: o?.PK ? o.PK.replace('ORDER#', '').substring(0, 14) + '...' : 'N/A',
    createdAt: o?.createdAt ? formatDate(o.createdAt) : 'Nepoznato',
    customer: `${o?.personalInfo?.name || 'Nepoznato'} (${o?.delivery?.city || 'Nepoznato'})`,
    pickupDate: o?.delivery?.date ? new Date(o.delivery.date).toLocaleDateString('hr-HR') : 'N/A',
    status: o?.status || 'NOVO'
  }))
})

// --- 2. LOGIKA ZA POSTAVKE VOZILA ---
const vehicle = ref({ length: 0, width: 0, height: 0, maxWeight: 0 })
const isSavingVehicle = ref(false)

const { data: vehicleData } = await useFetch('/api/admin/settings/vehicle')
if (vehicleData.value?.success && vehicleData.value?.data) {
  vehicle.value = vehicleData.value.data
}

const vehicleVolume = computed(() => {
  const vol = (vehicle.value.length * vehicle.value.width * vehicle.value.height) / 1000000
  return Number(vol.toFixed(2))
})

async function saveVehicle() {
  isSavingVehicle.value = true
  try {
    await $fetch('/api/admin/settings/vehicle', { method: 'POST', body: vehicle.value })
    alert('Kapaciteti vozila uspješno su spremljeni u bazu!')
  } catch (err) {
    alert('Dogodila se greška prilikom spremanja vozila.')
  } finally {
    isSavingVehicle.value = false
  }
}

// --- 3. LOGIKA ZA POSTAVKE CJENIKA ---
const pricing = ref({
  basePrice: 5,
  roomDeliverySurcharge: 25,
  weightTiers: [{ max: 15, add: 0 }, { max: 30, add: 5 }, { max: 100, add: 15 }, { max: 250, add: 25 }, { max: 99999, add: 40 }],
  volumeTiers: [{ max: 0.1, add: 0 }, { max: 0.5, add: 5 }, { max: 1.0, add: 15 }, { max: 99999, add: 25 }]
})
const isSavingPricing = ref(false)

const { data: pricingData } = await useFetch('/api/admin/settings/pricing')
if (pricingData.value?.success && pricingData.value?.data) {
  pricing.value = pricingData.value.data
}

async function savePricing() {
  isSavingPricing.value = true
  try {
    await $fetch('/api/admin/settings/pricing', { method: 'POST', body: pricing.value })
    alert('Cjenik je uspješno spremljen u bazu!')
  } catch (err) {
    alert('Dogodila se greška prilikom spremanja cjenika.')
  } finally {
    isSavingPricing.value = false
  }
}

function addWeightTier() { pricing.value.weightTiers.push({ max: 0, add: 0 }) }
function removeWeightTier(idx: number) { pricing.value.weightTiers.splice(idx, 1) }
function addVolumeTier() { pricing.value.volumeTiers.push({ max: 0, add: 0 }) }
function removeVolumeTier(idx: number) { pricing.value.volumeTiers.splice(idx, 1) }

// --- 4. LOGIKA ZA KALENDAR ---
const calendarDate = ref(new Date())

const currentMonthName = computed(() => {
  return calendarDate.value.toLocaleString('hr-HR', { month: 'long' })
})
const currentYear = computed(() => calendarDate.value.getFullYear())

function prevMonth() {
  calendarDate.value = new Date(calendarDate.value.getFullYear(), calendarDate.value.getMonth() - 1, 1)
}

function nextMonth() {
  calendarDate.value = new Date(calendarDate.value.getFullYear(), calendarDate.value.getMonth() + 1, 1)
}

const ordersByDate = computed(() => {
  const map = new Map<string, { count: number, volume: number }>()

  if (data.value && data.value.orders) {
    data.value.orders.forEach((o: any) => {
      if (o.delivery?.date && o.status !== 'OTKAZANO') {
        const dateStr = o.delivery.date.split('T')[0]
        const vol = o.transport?.totalVolume || 0

        const existing = map.get(dateStr) || { count: 0, volume: 0 }
        map.set(dateStr, { count: existing.count + 1, volume: existing.volume + vol })
      }
    })
  }
  return map
})

const calendarDays = computed(() => {
  const year = calendarDate.value.getFullYear()
  const month = calendarDate.value.getMonth()

  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days = []
  for (let i = 0; i < firstDayIndex; i++) { days.push(null) }
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    const stats = ordersByDate.value.get(dateStr) || { count: 0, volume: 0 }
    days.push({ day: i, dateStr, ...stats })
  }
  return days
})

// --- 5. NOVA LOGIKA ZA MJESEČNI OVERVIEW (STATISTIKA) ---
const selectedStatsMonth = ref(new Date().getMonth()) // Trenutni mjesec default
const selectedStatsYear = ref(new Date().getFullYear())

const monthsOptions = [
  { value: 0, label: 'Siječanj' }, { value: 1, label: 'Veljača' }, { value: 2, label: 'Ožujak' },
  { value: 3, label: 'Travanj' }, { value: 4, label: 'Svibanj' }, { value: 5, label: 'Lipanj' },
  { value: 6, label: 'Srpanj' }, { value: 7, label: 'Kolovoz' }, { value: 8, label: 'Rujan' },
  { value: 9, label: 'Listopad' }, { value: 10, label: 'Studeni' }, { value: 11, label: 'Prosinac' }
]

const monthlyAnalytics = computed(() => {
  let totalRevenue = 0
  let completedCount = 0
  let totalWeightCarried = 0

  if (data.value && data.value.orders) {
    data.value.orders.forEach((o: any) => {
      // Filtriramo samo uspješno isporučene narudžbe za odabrani mjesec i godinu
      if (o.status === 'DOSTAVLJENO' && o.delivery?.date) {
        const orderDate = new Date(o.delivery.date)

        if (orderDate.getMonth() === selectedStatsMonth.value && orderDate.getFullYear() === selectedStatsYear.value) {
          completedCount++
          totalRevenue += Number(o.transport?.price || 0)
          totalWeightCarried += Number(o.transport?.totalWeight || 0)
        }
      }
    })
  }

  const averagePerOrder = completedCount > 0 ? (totalRevenue / completedCount).toFixed(2) : '0.00'

  return {
    revenue: totalRevenue.toFixed(2),
    count: completedCount,
    weight: totalWeightCarried.toFixed(1),
    average: averagePerOrder
  }
})
</script>

<template>
  <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 font-sans">

    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-gray-900 tracking-tight">Nadzorna ploča</h1>
        <p class="text-gray-500 mt-1">Pregled poslovanja, financijska analitika i kalendar kapaciteta.</p>
      </div>
      <UButton
        icon="i-lucide-refresh-cw"
        color="gray"
        variant="solid"
        class="shadow-sm font-bold"
        @click="refresh"
        :loading="pending"
      >
        Osvježi podatke
      </UButton>
    </div>

    <UCard class="shadow-md border border-gray-200 overflow-hidden relative bg-gray-900 text-white">
      <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-bl-full opacity-10 pointer-events-none"></div>

      <template #header>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-bar-chart-3" class="w-6 h-6 text-yellow-400" />
            <h2 class="font-black text-lg text-white">Poslovna analitika i promet</h2>
          </div>

          <div class="flex items-center gap-2 text-black">
            <select v-model="selectedStatsMonth" class="rounded-lg border border-gray-700 bg-white text-sm p-1.5 font-bold">
              <option v-for="m in monthsOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
            </select>
            <select v-model="selectedStatsYear" class="rounded-lg border border-gray-700 bg-white text-sm p-1.5 font-bold">
              <option v-for="y in [2025, 2026, 2027]" :key="y" :value="y">{{ y }}.</option>
            </select>
          </div>
        </div>
      </template>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 p-2">
        <div class="bg-gray-800/60 border border-gray-700 rounded-2xl p-4 text-center">
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Ukupna naplata</p>
          <p class="text-3xl font-black text-yellow-400">{{ monthlyAnalytics.revenue }} €</p>
          <p class="text-[10px] text-gray-500 mt-1">Samo status "Dostavljeno"</p>
        </div>

        <div class="bg-gray-800/60 border border-gray-700 rounded-2xl p-4 text-center">
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Odrađeno dostava</p>
          <p class="text-3xl font-black text-emerald-400">{{ monthlyAnalytics.count }} kom</p>
          <p class="text-[10px] text-gray-500 mt-1">Uspješno isporučeno</p>
        </div>

        <div class="bg-gray-800/60 border border-gray-700 rounded-2xl p-4 text-center">
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Prosjek po dostavi</p>
          <p class="text-3xl font-black text-sky-400">{{ monthlyAnalytics.average }} €</p>
          <p class="text-[10px] text-gray-500 mt-1">Zarada po klijentu</p>
        </div>

        <div class="bg-gray-800/60 border border-gray-700 rounded-2xl p-4 text-center">
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Prenesena težina</p>
          <p class="text-3xl font-black text-purple-400">{{ monthlyAnalytics.weight }} kg</p>
          <p class="text-[10px] text-gray-500 mt-1">Ukupna tonaža robe</p>
        </div>
      </div>
    </UCard>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <UCard class="shadow-sm border border-gray-200 flex flex-col h-full">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-truck" class="w-6 h-6 text-gray-900" />
            <h2 class="font-bold text-lg text-gray-900">Kapaciteti dostavnog vozila</h2>
          </div>
        </template>
        <form @submit.prevent="saveVehicle" class="flex-1 flex flex-col">
          <div class="grid grid-cols-2 gap-4 flex-1">
            <UFormField label="Maks. Dužina (cm)"><UInput v-model="vehicle.length" type="number" icon="i-lucide-ruler" class="w-full" /></UFormField>
            <UFormField label="Maks. Širina (cm)"><UInput v-model="vehicle.width" type="number" icon="i-lucide-ruler" class="w-full" /></UFormField>
            <UFormField label="Maks. Visina (cm)"><UInput v-model="vehicle.height" type="number" icon="i-lucide-ruler" class="w-full" /></UFormField>
            <UFormField label="Nosivost (kg)"><UInput v-model="vehicle.maxWeight" type="number" icon="i-lucide-weight" class="w-full" /></UFormField>
          </div>
          <div class="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
            <div class="text-xs text-gray-500">Volumen: <UBadge color="gray" variant="solid" class="font-bold ml-1">{{ vehicleVolume }} m³</UBadge></div>
            <UButton type="submit" color="black" icon="i-lucide-save" :loading="isSavingVehicle" class="font-bold">Spremi vozilo</UButton>
          </div>
        </form>
      </UCard>

      <UCard class="shadow-sm border border-gray-200 flex flex-col h-full">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-calculator" class="w-6 h-6 text-gray-900" />
            <h2 class="font-bold text-lg text-gray-900">Cjenik dostave</h2>
          </div>
        </template>
        <form @submit.prevent="savePricing" class="flex-1 flex flex-col">
          <div class="grid grid-cols-2 gap-4 bg-yellow-50/50 p-4 rounded-xl border border-yellow-100 mb-6">
            <UFormField label="Osnovna cijena starta (€)"><UInput v-model="pricing.basePrice" type="number" step="0.1" icon="i-lucide-coins" class="w-full bg-white" /></UFormField>
            <UFormField label="Nadoplata za unos u prostor (€)"><UInput v-model="pricing.roomDeliverySurcharge" type="number" step="0.1" icon="i-lucide-arrow-up-circle" class="w-full bg-white" /></UFormField>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            <div>
              <div class="flex items-center justify-between mb-3 border-b pb-2"><span class="font-bold text-sm text-gray-700">Tijers po težini</span><UButton size="xs" color="gray" variant="soft" icon="i-lucide-plus" @click="addWeightTier">Dodaj</UButton></div>
              <div class="space-y-2 max-h-48 overflow-y-auto pr-2">
                <div v-for="(tier, idx) in pricing.weightTiers" :key="'w'+idx" class="flex items-end gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <UFormField label="Do (kg)" class="flex-1"><UInput v-model="tier.max" type="number" step="0.1" size="sm" class="w-full" /></UFormField>
                  <UFormField label="Cijena (€)" class="flex-1"><UInput v-model="tier.add" type="number" step="0.1" size="sm" class="w-full" /></UFormField>
                  <UButton color="red" variant="soft" icon="i-lucide-trash" size="sm" class="mb-1 shrink-0" @click="removeWeightTier(idx)" />
                </div>
              </div>
            </div>
            <div>
              <div class="flex items-center justify-between mb-3 border-b pb-2"><span class="font-bold text-sm text-gray-700">Tijers po volumenu</span><UButton size="xs" color="gray" variant="soft" icon="i-lucide-plus" @click="addVolumeTier">Dodaj</UButton></div>
              <div class="space-y-2 max-h-48 overflow-y-auto pr-2">
                <div v-for="(tier, idx) in pricing.volumeTiers" :key="'v'+idx" class="flex items-end gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <UFormField label="Do (m³)" class="flex-1"><UInput v-model="tier.max" type="number" step="0.1" size="sm" class="w-full" /></UFormField>
                  <UFormField label="Cijena (€)" class="flex-1"><UInput v-model="tier.add" type="number" step="0.1" size="sm" class="w-full" /></UFormField>
                  <UButton color="red" variant="soft" icon="i-lucide-trash" size="sm" class="mb-1 shrink-0" @click="removeVolumeTier(idx)" />
                </div>
              </div>
            </div>
          </div>
          <div class="mt-6 pt-4 border-t border-gray-100 flex justify-end"><UButton type="submit" color="black" icon="i-lucide-save" :loading="isSavingPricing" class="font-bold">Spremi cjenik</UButton></div>
        </form>
      </UCard>
    </div>

    <UCard class="shadow-md border border-gray-200 mt-8">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-calendar-days" class="w-6 h-6 text-blue-600" />
            <h2 class="font-black text-lg text-gray-900">Kalendar kapaciteta</h2>
          </div>
          <div class="flex items-center gap-4">
            <UButton icon="i-lucide-chevron-left" color="gray" variant="soft" size="sm" @click="prevMonth" />
            <span class="font-bold text-gray-800 capitalize w-32 text-center">{{ currentMonthName }} {{ currentYear }}</span>
            <UButton icon="i-lucide-chevron-right" color="gray" variant="soft" size="sm" @click="nextMonth" />
          </div>
        </div>
      </template>
      <div class="grid grid-cols-7 gap-2 mb-2">
        <div v-for="d in ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned']" :key="d" class="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ d }}</div>
      </div>
      <div class="grid grid-cols-7 gap-2">
        <div v-for="(day, index) in calendarDays" :key="index" class="border rounded-xl min-h-[100px] p-2 flex flex-col transition-all" :class="day ? 'bg-white border-gray-200 hover:border-gray-300 shadow-sm' : 'bg-gray-50/50 border-transparent'">
          <template v-if="day">
            <div class="text-xs font-black text-gray-400 mb-1" :class="{'text-gray-900': day.count > 0}">{{ day.day }}</div>
            <div v-if="day.count > 0" class="flex-1 flex flex-col justify-end gap-1.5 mt-2 animate-fade-in">
              <UBadge color="black" variant="soft" size="xs" class="justify-center font-bold">{{ day.count }} {{ day.count === 1 ? 'narudžba' : 'narudžbe' }}</UBadge>
              <div class="mt-1">
                <div class="flex justify-between text-[9px] font-bold text-gray-500 mb-1 px-0.5"><span>{{ day.volume.toFixed(2) }} m³</span><span v-if="vehicleVolume > 0">{{ Math.round((day.volume / vehicleVolume) * 100) }}%</span></div>
                <div v-if="vehicleVolume > 0" class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div class="h-full transition-all duration-500" :class="day.volume > vehicleVolume ? 'bg-red-500' : (day.volume >= vehicleVolume * 0.8 ? 'bg-yellow-500' : 'bg-green-500')" :style="{ width: Math.min((day.volume / vehicleVolume) * 100, 100) + '%' }"></div>
                </div>
                <div v-if="day.volume > vehicleVolume" class="text-[9px] font-bold text-red-500 mt-1 text-center">Prebukirano!</div>
              </div>
            </div>
            <div v-else class="flex-1 flex items-center justify-center opacity-30"><UIcon name="i-lucide-calendar-x" class="w-4 h-4 text-gray-300" /></div>
          </template>
        </div>
      </div>
    </UCard>

    <UCard class="shadow-md overflow-hidden border border-gray-200 mt-8">
      <div v-if="pending" class="py-16 flex flex-col items-center justify-center text-gray-400"><UIcon name="i-lucide-loader-2" class="w-10 h-10 animate-spin mb-4" /><p class="font-medium text-lg">Učitavanje narudžbi...</p></div>
      <div v-else-if="error" class="py-16 flex flex-col items-center justify-center text-red-500"><UIcon name="i-lucide-alert-circle" class="w-10 h-10 mb-4" /><p class="font-bold text-lg">Dogodila se greška prilikom učitavanja podataka.</p><p class="text-sm mt-2 text-red-400">{{ error.message }}</p></div>
      <div v-else-if="tableRows.length === 0" class="py-16 flex flex-col items-center justify-center text-gray-400"><UIcon name="i-lucide-inbox" class="w-10 h-10 mb-4 opacity-50" /><p class="font-medium text-lg">Trenutno nema zaprimljenih narudžbi.</p></div>

      <UTable v-else :columns="columns" :data="tableRows" class="w-full" :ui="{ th: { base: 'uppercase tracking-wider text-gray-500 font-bold' } }">
        <template #id-cell="{ row }"><span class="font-mono text-gray-600 font-medium bg-gray-50 px-2 py-1 rounded border">{{ row.original.id }}</span></template>
        <template #customer-cell="{ row }"><span class="font-bold text-gray-900">{{ row.original.customer }}</span></template>
        <template #status-cell="{ row }">
          <UBadge :color="row.original.status === 'NOVO' ? 'green' : (row.original.status === 'DOSTAVLJENO' ? 'gray' : 'yellow')" variant="soft" class="font-black tracking-wide">{{ row.original.status }}</UBadge>
        </template>
        <template #actions-cell="{ row }">
          <div class="text-right">
            <UButton :to="`/admin/${row.original.rawId}`" color="black" variant="soft" size="xs" class="font-bold" trailing-icon="i-lucide-arrow-right">Detalji</UButton>
          </div>
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
