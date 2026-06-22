<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, computed } from 'vue'

const route = useRoute()
const orderId = route.params.id

const { data, pending, error, refresh } = await useFetch(`/api/admin/orders/${orderId}`)

const formatDate = (isoString: string) => {
  if (!isoString) return ''
  return new Date(isoString).toLocaleDateString('hr-HR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

// --- LOGIKA ZA PROMJENU STATUSA ---
const isUpdating = ref(false)

const availableStatuses = [
  { value: 'NOVO', label: 'Zaprimljeno', icon: 'i-lucide-inbox', bgClass: 'bg-gray-500', textClass: 'text-gray-500' },
  { value: 'U_OBRADI', label: 'Čeka se PIN', icon: 'i-lucide-key', bgClass: 'bg-yellow-500', textClass: 'text-yellow-600' },
  { value: 'NA_PUTU_DO_IKEA', label: 'Slijedi utovar', icon: 'i-lucide-truck', bgClass: 'bg-blue-500', textClass: 'text-blue-600' },
  { value: 'PREUZETO', label: 'Preuzeto (U vožnji)', icon: 'i-lucide-package-check', bgClass: 'bg-purple-500', textClass: 'text-purple-600' },
  { value: 'DOSTAVLJENO', label: 'Dostavljeno', icon: 'i-lucide-check-circle-2', bgClass: 'bg-green-500', textClass: 'text-green-600' }
]

const currentStatusValue = computed(() => data.value?.order?.status || 'NOVO')

const currentStatusIndex = computed(() => {
  return availableStatuses.findIndex(s => s.value === currentStatusValue.value)
})

const currentStatusObj = computed(() => {
  return availableStatuses[currentStatusIndex.value] || availableStatuses[0]
})

const nextStatusAction = computed(() => {
  if (currentStatusIndex.value === -1 || currentStatusIndex.value === availableStatuses.length - 1) return null
  return availableStatuses[currentStatusIndex.value + 1]
})

async function updateToNextStatus() {
  if (!nextStatusAction.value) return
  isUpdating.value = true
  try {
    await $fetch(`/api/admin/orders/${orderId}`, {
      method: 'PUT',
      body: { status: nextStatusAction.value.value }
    })
    await refresh()
  } catch (err) {
    alert('Došlo je do greške prilikom promjene statusa.')
    console.error(err)
  } finally {
    isUpdating.value = false
  }
}

// --- GENERIRANJE LINKA ZA STATUS NARUDŽBE U IKEA SUSTAVU ---
const ikeaTrackingUrl = computed(() => {
  if (!data.value?.order?.ikeaDetails) return '#'
  const orderNumber = data.value.order.ikeaDetails.orderNumber
  return `https://www.ikea.com/hr/hr/purchases/lookup/${encodeURIComponent(orderNumber)}/`
})
</script>

<template>
  <div class="min-h-screen flex flex-col font-sans bg-gray-50 text-neutral-900 selection:bg-yellow-400 selection:text-black">

    <!-- ZAJEDNIČKI HEADER -->
    <AppHeader />

    <!-- GLAVNI SADRŽAJ -->
    <main class="flex-grow">
      <div class="max-w-5xl mx-auto py-8 px-4 sm:px-6">

        <!-- LOADING STATE -->
        <div v-if="pending" class="py-32 flex flex-col items-center justify-center text-gray-400">
          <UIcon name="i-lucide-loader-2" class="w-12 h-12 animate-spin mb-4 text-yellow-500" />
          <p class="font-medium text-lg">Učitavanje detalja narudžbe...</p>
        </div>

        <!-- ERROR STATE -->
        <div v-else-if="error || !data?.order" class="py-20 text-center">
          <UAlert icon="i-lucide-alert-circle" color="red" variant="soft" title="Greška" description="Narudžba nije pronađena ili se dogodila greška na serveru." />
          <UButton to="/admin/dashboard" color="gray" variant="soft" class="mt-4 font-bold" icon="i-lucide-arrow-left">Povratak na nadzornu ploču</UButton>
        </div>

        <!-- MAIN CONTENT -->
        <div v-else class="space-y-8 animate-fade-in">

          <!-- 1. ZAGLAVLJE -->
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <UButton to="/admin/dashboard" color="gray" variant="ghost" icon="i-lucide-arrow-left" class="mb-4 -ml-2 font-bold text-gray-500">
                Nazad na popis
              </UButton>
              <div class="flex items-center gap-3">
                <h1 class="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Pregled narudžbe</h1>
              </div>
              <p class="text-sm font-mono text-gray-500 mt-1 flex items-center gap-1.5">
                <UIcon name="i-lucide-hash" class="w-4 h-4" /> {{ data.order.PK.replace('ORDER#', '') }}
              </p>
            </div>

            <!-- CIJENA (NAGLAŠENA) -->
            <div class="bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-lg border border-gray-800 flex items-center gap-4 shrink-0">
              <div class="bg-gray-800 p-2.5 rounded-xl"><UIcon name="i-lucide-wallet" class="w-6 h-6 text-yellow-400" /></div>
              <div>
                <p class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Za naplatu kupcu</p>
                <p class="text-3xl font-black text-yellow-400 leading-none">{{ data.order.transport.price }} €</p>
              </div>
            </div>
          </div>

          <!-- 2. KONTROLA STATUSA (ACTION PANEL) -->
          <div class="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">

            <!-- Action sekcija (Trenutno vs Sljedeće) -->
            <div class="p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-gray-50/50">
              <div class="text-center md:text-left w-full md:w-auto">
                <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Trenutni status</p>
                <div class="flex items-center justify-center md:justify-start gap-2">
                  <UIcon :name="currentStatusObj.icon" class="w-6 h-6" :class="currentStatusObj.textClass" />
                  <h2 class="text-2xl font-black text-gray-900">{{ currentStatusObj.label }}</h2>
                </div>
              </div>

              <div class="hidden md:block w-px h-12 bg-gray-200"></div>

              <div class="w-full md:w-auto text-center md:text-right">
                <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Akcija za vozača</p>

                <UButton
                  v-if="nextStatusAction"
                  color="black"
                  size="xl"
                  icon="i-lucide-arrow-right"
                  trailing
                  class="w-full md:w-auto justify-center font-black shadow-md hover:-translate-y-0.5 transition-transform"
                  :loading="isUpdating"
                  @click="updateToNextStatus"
                >
                  Prebaci u: {{ nextStatusAction.label }}
                </UButton>

                <div v-else class="text-green-700 font-bold flex items-center justify-center md:justify-end gap-2 bg-green-100 px-5 py-2.5 rounded-xl border border-green-200">
                  <UIcon name="i-lucide-check-circle" class="w-6 h-6" /> Isporuka je uspješno završena!
                </div>
              </div>
            </div>

            <!-- Vizualni Stepper (Vremenska crta) -->
            <div class="px-6 py-8 border-t border-gray-100">
              <div class="relative max-w-4xl mx-auto">
                <!-- Linija u pozadini -->
                <div class="absolute left-0 top-1/2 -mt-px w-full h-1 bg-gray-100 rounded-full z-0"></div>
                <!-- Popunjena linija -->
                <div class="absolute left-0 top-1/2 -mt-px h-1 bg-yellow-400 rounded-full z-0 transition-all duration-500"
                     :style="{ width: `${(currentStatusIndex / (availableStatuses.length - 1)) * 100}%` }">
                </div>

                <!-- Koraci -->
                <div class="relative z-10 flex justify-between">
                  <div v-for="(status, index) in availableStatuses" :key="status.value" class="flex flex-col items-center gap-2 group">
                    <!-- Krug -->
                    <div class="w-10 h-10 rounded-full border-4 border-white flex items-center justify-center transition-all duration-300"
                         :class="[
                           index < currentStatusIndex ? 'bg-gray-800 text-white' : '',
                           index === currentStatusIndex ? 'bg-yellow-400 text-gray-900 shadow-md ring-4 ring-yellow-50' : '',
                           index > currentStatusIndex ? 'bg-gray-100 text-gray-300' : ''
                         ]">
                      <UIcon v-if="index < currentStatusIndex" name="i-lucide-check" class="w-5 h-5" />
                      <UIcon v-else :name="status.icon" class="w-5 h-5" />
                    </div>
                    <!-- Tekst ispod kruga -->
                    <span class="text-[10px] sm:text-xs font-bold text-center max-w-[70px] leading-tight hidden sm:block"
                          :class="index <= currentStatusIndex ? 'text-gray-900' : 'text-gray-400'">
                      {{ status.label }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. KARTICE S INFORMACIJAMA (GRID) -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <!-- KUPAC -->
            <UCard class="shadow-sm border border-gray-200">
              <template #header>
                <h3 class="font-bold text-gray-900 flex items-center gap-2">
                  <UIcon name="i-lucide-user" class="text-blue-500 w-5 h-5"/> Podaci o kupcu
                </h3>
              </template>
              <div class="space-y-4 text-sm">
                <div>
                  <p class="text-xs text-gray-500 font-bold uppercase">Ime i prezime</p>
                  <p class="font-black text-gray-900 text-base">{{ data.order.personalInfo.name }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 font-bold uppercase">Kontakt broj</p>
                  <a :href="`tel:${data.order.personalInfo.phone}`" class="text-blue-600 font-bold flex items-center gap-1 hover:underline">
                    <UIcon name="i-lucide-phone-call" class="w-4 h-4"/> {{ data.order.personalInfo.phone }}
                  </a>
                </div>
                <div>
                  <p class="text-xs text-gray-500 font-bold uppercase">E-mail adresa</p>
                  <a :href="`mailto:${data.order.personalInfo.email}`" class="text-gray-700 font-medium hover:underline">{{ data.order.personalInfo.email }}</a>
                </div>
                <div class="pt-3 border-t border-gray-100">
                  <p class="text-xs text-gray-400 font-medium">Naručeno: {{ formatDate(data.order.createdAt) }}</p>
                </div>
              </div>
            </UCard>

            <!-- DOSTAVA -->
            <UCard class="shadow-sm border border-gray-200">
              <template #header>
                <div class="flex justify-between items-center">
                  <h3 class="font-bold text-gray-900 flex items-center gap-2">
                    <UIcon name="i-lucide-map-pin" class="text-red-500 w-5 h-5"/> Adresa isporuke
                  </h3>
                  <UBadge color="gray" variant="solid" class="font-bold bg-gray-100 text-gray-800">
                    {{ new Date(data.order.delivery.date).toLocaleDateString('hr-HR') }}
                  </UBadge>
                </div>
              </template>
              <div class="space-y-4 text-sm">
                <div>
                  <p class="text-xs text-gray-500 font-bold uppercase">Ulica i grad</p>
                  <p class="font-black text-gray-900 text-base leading-tight">{{ data.order.delivery.street }}<br/>{{ data.order.delivery.zip }} {{ data.order.delivery.city }}</p>
                </div>

                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p class="text-xs text-gray-500 font-bold uppercase mb-1">Tip istovara</p>
                  <p class="font-black text-gray-900 uppercase text-sm mb-2 flex items-center gap-1.5">
                    <UIcon :name="data.order.delivery.option === 'room' ? 'i-lucide-arrow-up-circle' : 'i-lucide-arrow-down-circle'" class="w-4 h-4 text-yellow-600"/>
                    {{ data.order.delivery.option === 'room' ? 'Unos u prostoriju' : 'Istovar na prilazu' }}
                  </p>

                  <div v-if="data.order.delivery.option === 'room'" class="flex items-center gap-2">
                    <UBadge color="white" class="border border-gray-200 text-gray-700">
                      {{ data.order.delivery.objectType === 'zgrada' ? `${data.order.delivery.floor}. kat` : 'Kuća' }}
                    </UBadge>
                    <UBadge v-if="data.order.delivery.objectType === 'zgrada'" :color="data.order.delivery.hasElevator ? 'green' : 'red'" variant="subtle" class="font-bold">
                      {{ data.order.delivery.hasElevator ? 'Ima lift' : 'Nema lifta' }}
                    </UBadge>
                  </div>
                </div>

                <div v-if="data.order.delivery.notes" class="bg-yellow-50 p-3 rounded-xl border border-yellow-200 text-yellow-900 text-sm font-medium flex items-start gap-2">
                  <UIcon name="i-lucide-message-square-warning" class="w-5 h-5 shrink-0 mt-0.5 text-yellow-600" />
                  <span>{{ data.order.delivery.notes }}</span>
                </div>
              </div>
            </UCard>

            <!-- IKEA PODACI -->
            <UCard class="shadow-sm border border-blue-200 bg-blue-50/30">
              <template #header>
                <h3 class="font-bold text-blue-900 flex items-center gap-2">
                  <UIcon name="i-lucide-shopping-cart" class="text-blue-600 w-5 h-5"/> IKEA Informacije
                </h3>
              </template>
              <div class="space-y-5 text-sm">
                <div>
                  <p class="text-xs text-blue-600/70 font-bold uppercase mb-1">Broj narudžbe</p>
                  <div class="flex items-center gap-2">
                    <p class="font-black text-blue-950 text-2xl tracking-wider">{{ data.order.ikeaDetails.orderNumber }}</p>
                    <UButton :to="ikeaTrackingUrl" target="_blank" color="white" size="2xs" icon="i-lucide-external-link" title="Prati u IKEA-i" />
                  </div>
                </div>

                <div v-if="data.order.ikeaDetails.lockerLocation" class="bg-white border border-blue-100 p-3 rounded-xl shadow-sm">
                  <p class="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Podaci iz paketomata</p>
                  <div class="flex gap-4">
                    <div><span class="text-gray-500 text-xs">Oznaka:</span> <span class="font-black text-gray-900">{{ data.order.ikeaDetails.lockerLocation }}</span></div>
                    <div><span class="text-gray-500 text-xs">PIN:</span> <span class="font-mono font-black text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{{ data.order.ikeaDetails.lockerPin }}</span></div>
                  </div>
                </div>
                <div v-else class="text-xs font-bold text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100 flex items-center gap-2">
                  <UIcon name="i-lucide-clock" class="w-4 h-4 shrink-0" /> Kupac još nije poslao PIN.
                </div>

                <div class="pt-4 border-t border-blue-100 space-y-2">
                  <p class="text-xs text-gray-500 truncate" :title="data.order.ikeaDetails.ikeaEmail">E-mail: <strong>{{ data.order.ikeaDetails.ikeaEmail }}</strong></p>
                  <UButton :to="data.order.ikeaDetails.listUrl" target="_blank" color="blue" variant="soft" size="sm" class="w-full justify-center font-bold" trailing-icon="i-lucide-external-link">
                    Otvori IKEA košaricu
                  </UButton>
                </div>
              </div>
            </UCard>
          </div>

          <!-- 4. POPIS TERETA (TRANSPORT) -->
          <div class="shadow-sm rounded-3xl overflow-hidden border border-gray-200 bg-white">
            <!-- Teret Header -->
            <div class="bg-gray-50 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 gap-4">
              <h2 class="text-lg font-black text-gray-900 flex items-center gap-2">
                <UIcon name="i-lucide-package" class="w-5 h-5 text-gray-500" /> Popis tereta za utovar
              </h2>
              <div class="flex flex-wrap gap-2 text-xs font-bold">
                <span class="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm text-gray-600">Paketa: <span class="text-gray-900 font-black">{{ data.order.transport.totalBoxes }} kom</span></span>
                <span class="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm text-gray-600">Težina: <span class="text-gray-900 font-black">{{ data.order.transport.totalWeight }} kg</span></span>
                <span class="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm text-gray-600">Volumen: <span class="text-gray-900 font-black">{{ data.order.transport.totalVolume }} m³</span></span>
              </div>
            </div>

            <!-- Teret Lista -->
            <div class="p-4 sm:p-6 space-y-4">
              <div v-for="group in data.order.transport.items" :key="group.code" class="border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:border-blue-200 transition-colors">

                <!-- Zaglavlje Proizvoda -->
                <div class="bg-white px-4 py-3 flex items-center gap-4 border-b border-gray-100">
                  <img v-if="group.image" :src="group.image" class="w-14 h-14 rounded-xl border border-gray-100 bg-gray-50 object-contain p-1 shrink-0" />
                  <div v-else class="w-14 h-14 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center text-gray-300">
                    <UIcon name="i-lucide-image" class="w-6 h-6" />
                  </div>
                  <div class="min-w-0">
                    <h4 class="font-black text-gray-900 text-base truncate">{{ group.name }}</h4>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="text-[10px] font-mono font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{{ group.code }}</span>
                      <span class="text-xs font-bold text-gray-400">{{ group.totalBoxes }} paketa</span>
                    </div>
                  </div>
                </div>

                <!-- Kutije unutar proizvoda -->
                <ul class="divide-y divide-gray-50 bg-gray-50/30">
                  <li v-for="pkg in group.packages" :key="pkg.code" class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div class="text-sm min-w-0">
                      <p class="font-bold text-gray-700">{{ pkg.name }}</p>
                      <p class="text-[10px] text-gray-400 font-mono tracking-wider mt-0.5 uppercase">Šifra kutije: {{ pkg.code }}</p>
                    </div>

                    <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                      <div>
                        <p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">D × Š × V (cm)</p>
                        <p class="font-mono text-gray-700 font-medium">{{ pkg.dimensions.length }} × {{ pkg.dimensions.width }} × {{ pkg.dimensions.height }}</p>
                      </div>
                      <div class="w-16">
                        <p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Težina</p>
                        <p class="font-black text-gray-900">{{ (pkg.dimensions.weight * pkg.quantity).toFixed(2) }} kg</p>
                      </div>
                      <div class="w-16">
                        <p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Volumen</p>
                        <p class="font-black text-gray-900">{{ (pkg.dimensions.volume * pkg.quantity).toFixed(3) }} m³</p>
                      </div>
                      <div class="font-black bg-white shadow-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-900 shrink-0 ml-auto sm:ml-0 flex items-center gap-1.5">
                        <UIcon name="i-lucide-layers" class="w-3 h-3 text-gray-400"/> {{ pkg.quantity }} kom
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- ZAJEDNIČKI FOOTER -->
    <AppFooter />
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
