<script setup lang="ts">
import { computed, ref } from 'vue'

// --- 1. POSTOJEĆA LOGIKA ZA NARUDŽBE ---
const { data, pending, error, refresh } = await useFetch('/api/admin/orders')

const formatDate = (isoString: string) => {
  if (!isoString) return ''
  return new Date(isoString).toLocaleDateString('hr-HR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

const columns = [
  { id: 'id', key: 'id', label: 'ID Narudžbe', accessorKey: 'id', header: 'ID Narudžbe' },
  { id: 'createdAt', key: 'createdAt', label: 'Zatraženo', accessorKey: 'createdAt', header: 'Zatraženo' },
  { id: 'customer', key: 'customer', label: 'Kupac', accessorKey: 'customer', header: 'Kupac' },
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

// --- 2. LOGIKA ZA VOZNI PARK I NERADNE DANE ---
const fleet = ref({
  vehicles: [] as any[],
  assignments: {} as Record<string, string>,
  inactiveDates: [] as string[]
})
const isSavingFleet = ref(false)

const { data: vehicleData } = await useFetch('/api/admin/settings/vehicle')
if (vehicleData.value?.success && vehicleData.value?.data) {
  const vd = vehicleData.value.data
  fleet.value = {
    vehicles: vd.vehicles || [],
    assignments: vd.assignments || {},
    inactiveDates: vd.inactiveDates || []
  }
}

if (!fleet.value.vehicles) fleet.value.vehicles = []
if (!fleet.value.assignments) fleet.value.assignments = {}
if (!fleet.value.inactiveDates) fleet.value.inactiveDates = []

function addVehicle() {
  fleet.value.vehicles.push({
    id: 'v_' + Date.now(), name: 'Novo vozilo', length: 200, width: 110, height: 90, maxWeight: 500
  })
}

function removeVehicle(index: number) { fleet.value.vehicles.splice(index, 1) }

async function saveFleet() {
  isSavingFleet.value = true
  try {
    await $fetch('/api/admin/settings/vehicle', { method: 'POST', body: fleet.value })
    alert('Raspored voznog parka uspješno je spremljen!')
  } catch (err) {
    alert('Dogodila se greška prilikom spremanja voznog parka.')
  } finally {
    isSavingFleet.value = false
  }
}

const assignDate = ref(new Date().toISOString().split('T')[0])
const assignVehicleId = ref('')

const isAssignDateInactive = computed(() => fleet.value.inactiveDates.includes(assignDate.value))

function assignVehicleToDate() {
  if (!assignDate.value || !assignVehicleId.value) return
  fleet.value.assignments[assignDate.value] = assignVehicleId.value
  saveFleet()
}

function toggleInactiveDate() {
  if (!assignDate.value) return
  const idx = fleet.value.inactiveDates.indexOf(assignDate.value)
  if (idx === -1) {
    fleet.value.inactiveDates.push(assignDate.value)
    delete fleet.value.assignments[assignDate.value]
  } else {
    fleet.value.inactiveDates.splice(idx, 1)
  }
  saveFleet()
}

// --- 3. LOGIKA ZA CJENIK ---
const pricing = ref({
  standard: 3.99,
  large: 6.99,
  driveway100: 43.99,
  room400: 95.20,
  room600: 103.20,
  room1000: 111.20,
  room1400: 207.20,
  roomOver1400: 250.00,
  disposal: 30.00
})
const isSavingPricing = ref(false)

const { data: pricingData } = await useFetch('/api/admin/settings/pricing')
if (pricingData.value?.success && pricingData.value?.data) {
  const pd = pricingData.value.data
  pricing.value = {
    standard: pd.standard ?? 3.99,
    large: pd.large ?? 6.99,
    driveway100: pd.driveway100 ?? 43.99,
    room400: pd.room400 ?? 95.20,
    room600: pd.room600 ?? 103.20,
    room1000: pd.room1000 ?? 111.20,
    room1400: pd.room1400 ?? 207.20,
    roomOver1400: pd.roomOver1400 ?? 250.00,
    disposal: pd.disposal ?? 30.00
  }
}

async function savePricing() {
  isSavingPricing.value = true
  try {
    await $fetch('/api/admin/settings/pricing', { method: 'POST', body: pricing.value })
    alert('Cjenik uspješno spremljen!')
  } catch (err) { alert('Dogodila se greška pri spremanju cjenika.') } finally { isSavingPricing.value = false }
}

// --- 4. KALENDAR ---
const calendarDate = ref(new Date())
const currentMonthName = computed(() => calendarDate.value.toLocaleString('hr-HR', { month: 'long' }))
const currentYear = computed(() => calendarDate.value.getFullYear())

function prevMonth() { calendarDate.value = new Date(calendarDate.value.getFullYear(), calendarDate.value.getMonth() - 1, 1) }
function nextMonth() { calendarDate.value = new Date(calendarDate.value.getFullYear(), calendarDate.value.getMonth() + 1, 1) }

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

    const isInactive = fleet.value.inactiveDates.includes(dateStr)
    const assignedVid = fleet.value.assignments[dateStr]
    const activeVehicle = fleet.value.vehicles.find(v => v.id === assignedVid) || fleet.value.vehicles[0]
    const capacity = activeVehicle ? (activeVehicle.length * activeVehicle.width * activeVehicle.height) / 1000000 : 0

    days.push({ day: i, dateStr, capacity, activeVehicleName: activeVehicle?.name, isInactive, ...stats })
  }
  return days
})

// --- 5. ANALITIKA ---
const selectedStatsMonth = ref(new Date().getMonth())
const selectedStatsYear = ref(new Date().getFullYear())
const monthsOptions = [
  { value: 0, label: 'Siječanj' }, { value: 1, label: 'Veljača' }, { value: 2, label: 'Ožujak' },
  { value: 3, label: 'Travanj' }, { value: 4, label: 'Svibanj' }, { value: 5, label: 'Lipanj' },
  { value: 6, label: 'Srpanj' }, { value: 7, label: 'Kolovoz' }, { value: 8, label: 'Rujan' },
  { value: 9, label: 'Listopad' }, { value: 10, label: 'Studeni' }, { value: 11, label: 'Prosinac' }
]

const monthlyAnalytics = computed(() => {
  let totalRevenue = 0, completedCount = 0, totalWeightCarried = 0
  if (data.value && data.value.orders) {
    data.value.orders.forEach((o: any) => {
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
  return {
    revenue: totalRevenue.toFixed(2), count: completedCount, weight: totalWeightCarried.toFixed(1),
    average: completedCount > 0 ? (totalRevenue / completedCount).toFixed(2) : '0.00'
  }
})

// --- 6. NAVIGACIJA PO STRANICI ---
const currentTab = ref('narudzbe')
</script>

<template>
  <div class="min-h-screen flex flex-col font-sans bg-gray-50 text-neutral-900 selection:bg-yellow-400 selection:text-black">

    <AppHeader />

    <main class="flex-grow">
      <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-200 pb-6">
          <div>
            <h1 class="text-3xl font-black text-gray-900 tracking-tight">Nadzorna ploča</h1>
            <p class="text-gray-500 mt-1 text-sm">Pratite promet, upravljajte isporukama i podešavajte aplikaciju.</p>
          </div>
          <div class="flex items-center gap-3 bg-gray-100 p-1.5 rounded-xl self-start md:self-auto">
            <button @click="currentTab = 'narudzbe'" class="px-4 py-2 text-sm font-bold rounded-lg transition-all" :class="currentTab === 'narudzbe' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'">Narudžbe i Promet</button>
            <button @click="currentTab = 'kalendar'" class="px-4 py-2 text-sm font-bold rounded-lg transition-all" :class="currentTab === 'kalendar' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'">Kalendar</button>
            <button @click="currentTab = 'postavke'" class="px-4 py-2 text-sm font-bold rounded-lg transition-all" :class="currentTab === 'postavke' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'">Postavke sustava</button>
          </div>
        </div>

        <div v-show="currentTab === 'narudzbe'" class="space-y-8 animate-fade-in">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2"><UIcon name="i-lucide-bar-chart-3" class="w-6 h-6 text-yellow-500" /> Analitika poslovanja</h2>
            <UButton icon="i-lucide-refresh-cw" color="gray" variant="soft" size="sm" class="font-bold" @click="refresh" :loading="pending">Osvježi podatke</UButton>
          </div>

          <UCard class="shadow-sm border border-gray-200 overflow-hidden relative bg-gray-900 text-white">
            <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-bl-full opacity-10 pointer-events-none"></div>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
              <p class="text-gray-400 text-sm font-medium">Odaberite mjesec za pregled prometa:</p>
              <div class="flex items-center gap-2 text-black">
                <select v-model="selectedStatsMonth" class="rounded-lg border-0 bg-white text-sm p-1.5 font-bold shadow-sm focus:ring-2 focus:ring-yellow-500 outline-none"><option v-for="m in monthsOptions" :key="m.value" :value="m.value">{{ m.label }}</option></select>
                <select v-model="selectedStatsYear" class="rounded-lg border-0 bg-white text-sm p-1.5 font-bold shadow-sm focus:ring-2 focus:ring-yellow-500 outline-none"><option v-for="y in [2025, 2026, 2027]" :key="y" :value="y">{{ y }}.</option></select>
              </div>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
              <div class="bg-gray-800/60 border border-gray-700 rounded-2xl p-5 text-center transition-transform hover:-translate-y-1">
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Zarada</p>
                <p class="text-3xl font-black text-yellow-400">{{ monthlyAnalytics.revenue }} €</p>
              </div>
              <div class="bg-gray-800/60 border border-gray-700 rounded-2xl p-5 text-center transition-transform hover:-translate-y-1">
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Dostave</p>
                <p class="text-3xl font-black text-emerald-400">{{ monthlyAnalytics.count }}</p>
              </div>
              <div class="bg-gray-800/60 border border-gray-700 rounded-2xl p-5 text-center transition-transform hover:-translate-y-1">
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Prosjek</p>
                <p class="text-3xl font-black text-sky-400">{{ monthlyAnalytics.average }} €</p>
              </div>
              <div class="bg-gray-800/60 border border-gray-700 rounded-2xl p-5 text-center transition-transform hover:-translate-y-1">
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Težina robe</p>
                <p class="text-3xl font-black text-purple-400">{{ monthlyAnalytics.weight }} kg</p>
              </div>
            </div>
          </UCard>

          <div class="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
              <h2 class="font-bold text-lg text-gray-900 flex items-center gap-2"><UIcon name="i-lucide-list-ordered" class="text-gray-400 w-5 h-5"/> Registar narudžbi</h2>
            </div>
            <div v-if="pending" class="py-16 flex flex-col items-center justify-center text-gray-400"><UIcon name="i-lucide-loader-2" class="w-10 h-10 animate-spin mb-4" /><p class="font-medium">Dohvaćam narudžbe...</p></div>

            <UTable v-else :columns="columns" :data="tableRows" class="w-full" :ui="{ th: { base: 'uppercase tracking-wider text-gray-500 font-bold bg-gray-50' }, td: { base: 'py-4' } }">
              <template #id-cell="{ row }"><span class="font-mono text-gray-600 font-medium bg-gray-50 px-2 py-1 rounded border">{{ row.original.id }}</span></template>
              <template #customer-cell="{ row }"><span class="font-bold text-gray-900">{{ row.original.customer }}</span></template>
              <template #status-cell="{ row }">
                <span v-if="row.original.status === 'NOVO'" class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black tracking-wider uppercase bg-gray-100 text-gray-700">Novo</span>
                <span v-else-if="row.original.status === 'U_OBRADI'" class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black tracking-wider uppercase bg-yellow-100 text-yellow-800">U obradi</span>
                <span v-else-if="row.original.status === 'NA_PUTU_DO_IKEA'" class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black tracking-wider uppercase bg-blue-100 text-blue-800">Utovar</span>
                <span v-else-if="row.original.status === 'PREUZETO'" class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black tracking-wider uppercase bg-purple-100 text-purple-800">Preuzeto</span>
                <span v-else-if="row.original.status === 'DOSTAVLJENO'" class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black tracking-wider uppercase bg-green-100 text-green-800">Dostavljeno</span>
                <span v-else-if="row.original.status === 'OTKAZANO'" class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black tracking-wider uppercase bg-red-100 text-red-800">Otkazano</span>
                <span v-else class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black tracking-wider uppercase bg-gray-100 text-gray-700">{{ row.original.status }}</span>
              </template>
              <template #actions-cell="{ row }"><div class="text-right"><UButton :to="`/admin/${row.original.rawId}`" color="black" variant="soft" size="xs" class="font-bold" trailing-icon="i-lucide-arrow-right">Detalji</UButton></div></template>
            </UTable>
          </div>
        </div>

        <div v-show="currentTab === 'kalendar'" class="space-y-6 animate-fade-in">
          <div class="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2 mb-2"><UIcon name="i-lucide-calendar-days" class="w-6 h-6 text-blue-500" /> Upravljanje danima</h2>
              <p class="text-sm text-gray-500 max-w-md">Odaberite datum kako biste mu dodijelili specifično vozilo iz voznog parka ili ga proglasili neradnim danom.</p>
            </div>
            <div class="flex flex-wrap items-end gap-3 bg-gray-50 border border-gray-200 p-3 rounded-xl">
              <UFormField label="Datum:"><UInput type="date" v-model="assignDate" size="sm" class="w-40 bg-white" /></UFormField>
              <div v-if="!isAssignDateInactive" class="flex items-end gap-2 border-l border-gray-200 pl-3">
                <UFormField label="Kombi za ovaj dan:">
                  <select v-model="assignVehicleId" class="w-40 rounded-md border border-gray-300 shadow-sm text-sm px-2 py-1.5 bg-white">
                    <option value="" disabled>Odaberite...</option>
                    <option v-for="v in fleet.vehicles" :key="v.id" :value="v.id">{{ v.name }}</option>
                  </select>
                </UFormField>
                <UButton color="black" icon="i-lucide-check" size="sm" class="mb-0.5 font-bold" @click="assignVehicleToDate">Spremi</UButton>
              </div>
              <div class="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>
              <UButton :color="isAssignDateInactive ? 'green' : 'red'" variant="soft" :icon="isAssignDateInactive ? 'i-lucide-calendar-check' : 'i-lucide-ban'" size="sm" class="mb-0.5 font-bold" @click="toggleInactiveDate">
                {{ isAssignDateInactive ? 'Aktiviraj dan' : 'Proglasi neradnim' }}
              </UButton>
            </div>
          </div>

          <UCard class="shadow-sm border border-gray-200">
            <template #header>
              <div class="flex justify-between items-center">
                <UButton icon="i-lucide-chevron-left" color="gray" variant="ghost" size="lg" @click="prevMonth" />
                <span class="text-xl font-black text-gray-900 capitalize">{{ currentMonthName }} {{ currentYear }}</span>
                <UButton icon="i-lucide-chevron-right" color="gray" variant="ghost" size="lg" @click="nextMonth" />
              </div>
            </template>
            <div class="grid grid-cols-7 gap-2 mb-3">
              <div v-for="d in ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned']" :key="d" class="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ d }}</div>
            </div>
            <div class="grid grid-cols-7 gap-2 lg:gap-3">
              <div v-for="(day, index) in calendarDays" :key="index" class="rounded-xl min-h-[120px] p-2 flex flex-col transition-all relative overflow-hidden" :class="day ? (day.isInactive ? 'bg-red-50/50 border border-red-200' : 'bg-white border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md cursor-pointer') : 'bg-transparent'">
                <template v-if="day">
                  <div v-if="day.isInactive" class="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
                    <div class="bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgNDBsNDAtNDBIMzBMMCAzMHYxMHptNDAgMEwwIDBoMTBMMDAgMzB2MTB6IiBmaWxsPSIjZmVmMmYyIiBmaWxsLW9wYWNpdHk9IjAuNCIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] absolute inset-0 opacity-50"></div>
                    <span class="text-red-500 font-black text-[10px] border border-red-200 bg-white px-2 py-1 rounded shadow-sm z-10 tracking-widest text-center">NERADNI</span>
                  </div>
                  <div class="flex justify-between items-start mb-1 relative z-10" @click="assignDate = day.dateStr">
                    <div class="text-sm font-black" :class="day.isInactive ? 'text-red-400' : (day.count > 0 ? 'text-gray-900' : 'text-gray-400')">{{ day.day }}</div>
                    <div v-if="day.activeVehicleName && !day.isInactive" class="text-[9px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider truncate max-w-[70px]" :title="day.activeVehicleName">{{ day.activeVehicleName }}</div>
                  </div>
                  <div v-if="day.count > 0 && !day.isInactive" class="flex-1 flex flex-col justify-end gap-2 mt-2 relative z-10">
                    <UBadge color="black" variant="subtle" size="xs" class="justify-center font-bold">{{ day.count }} isporuka</UBadge>
                    <div>
                      <div class="flex justify-between text-[10px] font-bold text-gray-500 mb-1 px-0.5"><span>{{ day.volume.toFixed(2) }} m³</span><span v-if="day.capacity > 0">{{ Math.round((day.volume / day.capacity) * 100) }}%</span></div>
                      <div v-if="day.capacity > 0" class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div class="h-full transition-all duration-500" :class="day.volume > day.capacity ? 'bg-red-500' : (day.volume >= day.capacity * 0.8 ? 'bg-yellow-500' : 'bg-green-500')" :style="{ width: Math.min((day.volume / day.capacity) * 100, 100) + '%' }"></div>
                      </div>
                      <div v-if="day.volume > day.capacity" class="text-[9px] font-bold text-red-500 mt-1 text-center bg-red-50 rounded">Prebukirano!</div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </UCard>
        </div>

        <div v-show="currentTab === 'postavke'" class="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-fade-in items-start">

          <UCard class="shadow-sm border border-gray-200 flex flex-col bg-white">
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2"><UIcon name="i-lucide-truck" class="w-6 h-6 text-gray-900" /><h2 class="font-bold text-lg text-gray-900">Vozni park</h2></div>
                <UButton size="sm" color="black" variant="soft" icon="i-lucide-plus" @click="addVehicle" class="font-bold">Dodaj vozilo</UButton>
              </div>
            </template>
            <form @submit.prevent="saveFleet" class="flex-1 flex flex-col">
              <p class="text-sm text-gray-500 mb-4">Ovdje dodajte sva vozila kojima raspolažete. Kapaciteti se automatski računaju.</p>

              <div class="space-y-4 flex-1">
                <div v-for="(v, index) in fleet.vehicles" :key="v.id" class="bg-gray-50 border border-gray-200 p-4 rounded-2xl relative hover:border-blue-200 transition-colors">
                  <div class="absolute top-3 right-3"><UButton color="red" variant="ghost" icon="i-lucide-trash-2" size="sm" @click="removeVehicle(index)" /></div>
                  <UFormField label="Naziv vozila" class="mb-4 pr-10"><UInput v-model="v.name" placeholder="Npr. Iveco Daily" class="w-full font-bold" size="lg" /></UFormField>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <UFormField label="Dužina (cm)"><UInput v-model="v.length" type="number" class="w-full bg-white" /></UFormField>
                    <UFormField label="Širina (cm)"><UInput v-model="v.width" type="number" class="w-full bg-white" /></UFormField>
                    <UFormField label="Visina (cm)"><UInput v-model="v.height" type="number" class="w-full bg-white" /></UFormField>
                    <UFormField label="Nosivost (kg)"><UInput v-model="v.maxWeight" type="number" class="w-full bg-white" /></UFormField>
                  </div>
                  <div class="mt-3 pt-3 border-t border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500 flex justify-between items-center">
                    <span>Ukupni volumen vozila:</span>
                    <span class="text-blue-600 text-sm bg-blue-50 px-2 py-1 rounded">{{ ((v.length * v.width * v.height) / 1000000).toFixed(2) }} m³</span>
                  </div>
                </div>
                <div v-if="fleet.vehicles.length === 0" class="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-gray-400">Nema dodanih vozila u floti.</div>
              </div>
              <div class="mt-6 pt-4 border-t border-gray-100 flex justify-end"><UButton type="submit" color="black" size="lg" icon="i-lucide-save" :loading="isSavingFleet" class="font-bold">Spremi promjene u floti</UButton></div>
            </form>
          </UCard>

          <UCard class="shadow-sm border border-gray-200 flex flex-col bg-white">
            <template #header>
              <div class="flex items-center gap-2"><UIcon name="i-lucide-calculator" class="w-6 h-6 text-gray-900" /><h2 class="font-bold text-lg text-gray-900">Cjenik usluga</h2></div>
            </template>
            <form @submit.prevent="savePricing" class="flex-1 flex flex-col">
              <p class="text-sm text-gray-500 mb-6">Upišite konačne cijene koje želite naplaćivati po definiranim kategorijama težine.</p>

              <div class="space-y-5 flex-1">

                <div class="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  <h3 class="font-bold text-gray-900 mb-3 flex items-center gap-2"><UIcon name="i-lucide-package" class="w-5 h-5 text-gray-500" /> Paketna dostava (Male narudžbe)</h3>
                  <div class="grid grid-cols-2 gap-4">
                    <UFormField label="Standardni (do 15kg)">
                      <UInput v-model="pricing.standard" type="number" step="0.01" icon="i-lucide-euro" class="w-full font-bold bg-white" />
                    </UFormField>
                    <UFormField label="Veliki (do 30kg)">
                      <UInput v-model="pricing.large" type="number" step="0.01" icon="i-lucide-euro" class="w-full font-bold bg-white" />
                    </UFormField>
                  </div>
                </div>

                <div class="bg-gray-900 p-4 rounded-2xl border border-gray-800 text-white">
                  <h3 class="font-bold text-white mb-3 flex items-center gap-2"><UIcon name="i-lucide-truck" class="w-5 h-5 text-yellow-400" /> Dostava do kolnog prilaza</h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <UFormField label="Težina do 100 kg">
                      <UInput v-model="pricing.driveway100" type="number" step="0.01" icon="i-lucide-euro" class="w-full font-bold text-black" />
                    </UFormField>
                  </div>
                </div>

                <div class="bg-yellow-50 p-4 rounded-2xl border border-yellow-200">
                  <h3 class="font-bold text-gray-900 mb-3 flex items-center gap-2"><UIcon name="i-lucide-home" class="w-5 h-5 text-yellow-600" /> Dostava u prostoriju (Unos)</h3>
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <UFormField label="0 - 400 kg">
                      <UInput v-model="pricing.room400" type="number" step="0.01" icon="i-lucide-euro" class="w-full font-bold bg-white" />
                    </UFormField>
                    <UFormField label="400 - 600 kg">
                      <UInput v-model="pricing.room600" type="number" step="0.01" icon="i-lucide-euro" class="w-full font-bold bg-white" />
                    </UFormField>
                    <UFormField label="600 - 1000 kg">
                      <UInput v-model="pricing.room1000" type="number" step="0.01" icon="i-lucide-euro" class="w-full font-bold bg-white" />
                    </UFormField>
                    <UFormField label="1000 - 1400 kg">
                      <UInput v-model="pricing.room1400" type="number" step="0.01" icon="i-lucide-euro" class="w-full font-bold bg-white" />
                    </UFormField>
                    <UFormField label="Preko 1400 kg">
                      <UInput v-model="pricing.roomOver1400" type="number" step="0.01" icon="i-lucide-euro" class="w-full font-bold bg-white text-red-600" />
                    </UFormField>
                  </div>
                </div>

                <div class="bg-blue-50 p-4 rounded-2xl border border-blue-200">
                  <h3 class="font-bold text-blue-900 mb-3 flex items-center gap-2"><UIcon name="i-lucide-wrench" class="w-5 h-5 text-blue-600" /> Dodatne usluge</h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <UFormField label="Odvoz starog namještaja (po komadu)">
                      <UInput v-model="pricing.disposal" type="number" step="0.01" icon="i-lucide-euro" class="w-full font-bold bg-white text-blue-900" />
                    </UFormField>
                  </div>
                </div>

              </div>
              <div class="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                <UButton type="submit" color="black" size="lg" icon="i-lucide-save" :loading="isSavingPricing" class="font-bold shadow-md hover:-translate-y-0.5 transition-transform">Spremi cjenik</UButton>
              </div>
            </form>
          </UCard>

        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.25s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
