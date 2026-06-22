<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const orderId = route.params.id as string

const { data, pending, error, refresh } = await useFetch(`/api/admin/orders/${orderId}`)

const formattedDate = computed(() => {
  if (!data.value?.order?.delivery?.date) return ''
  return new Date(data.value.order.delivery.date).toLocaleDateString('hr-HR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

const statuses = [
  { key: 'NOVO', label: 'Zaprimljeno', icon: 'i-lucide-inbox', textClass: 'text-gray-500', bgClass: 'bg-gray-500' },
  { key: 'U_OBRADI', label: 'U obradi', icon: 'i-lucide-loader-2', textClass: 'text-yellow-600', bgClass: 'bg-yellow-500' },
  { key: 'NA_PUTU_DO_IKEA', label: 'Slijedi utovar', icon: 'i-lucide-truck', textClass: 'text-blue-600', bgClass: 'bg-blue-500' },
  { key: 'PREUZETO', label: 'U vožnji', icon: 'i-lucide-package-check', textClass: 'text-purple-600', bgClass: 'bg-purple-500' },
  { key: 'DOSTAVLJENO', label: 'Dostavljeno', icon: 'i-lucide-check-circle-2', textClass: 'text-green-600', bgClass: 'bg-green-500' }
]

const currentStatusIndex = computed(() => {
  const current = data.value?.order?.status || 'NOVO'
  const index = statuses.findIndex(s => s.key === current)
  return index >= 0 ? index : 0
})

// --- LOGIKA ZA PAKETOMAT FORMU ---
const isPinProvided = computed(() => {
  return !!(data.value?.order?.ikeaDetails?.lockerPin)
})

const lockerLocation = ref('')
const lockerPin = ref('')
const isSubmittingPin = ref(false)
const pinError = ref('')
const pinSuccess = ref(false)

async function submitLockerData() {
  pinError.value = ''

  if (!lockerLocation.value || !lockerPin.value) {
    pinError.value = 'Molimo ispunite oba polja kako bismo mogli preuzeti Vašu robu.'
    return
  }

  isSubmittingPin.value = true

  try {
    await $fetch(`/api/order/${orderId}/pin`, {
      method: 'PUT',
      body: {
        lockerLocation: lockerLocation.value.trim().toUpperCase(),
        lockerPin: lockerPin.value.trim()
      }
    })

    pinSuccess.value = true
    await refresh()
  } catch (err: any) {
    pinError.value = err.data?.statusMessage || 'Dogodila se greška prilikom slanja podataka.'
  } finally {
    isSubmittingPin.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col font-sans bg-gray-50 text-neutral-900 selection:bg-yellow-400 selection:text-black">

    <!-- ZAJEDNIČKI HEADER -->
    <AppHeader />

    <!-- GLAVNI SADRŽAJ -->
    <main class="flex-grow py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">

        <!-- NASLOV -->
        <div class="text-center mb-10">
          <h1 class="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Status Vaše dostave</h1>
          <p class="text-gray-500 mt-2 font-mono text-sm bg-white inline-block px-4 py-1.5 rounded-full border border-gray-200 shadow-sm shadow-gray-100">
            Narudžba ID: <span class="font-bold text-gray-800">{{ orderId }}</span>
          </p>
        </div>

        <!-- UČITAVANJE -->
        <div v-if="pending" class="flex flex-col items-center justify-center bg-white p-20 rounded-3xl shadow-sm border border-gray-200">
          <UIcon name="i-lucide-loader-2" class="w-12 h-12 text-yellow-500 animate-spin mb-4" />
          <p class="text-gray-500 font-medium text-lg">Dohvaćam detalje isporuke...</p>
        </div>

        <!-- GREŠKA -->
        <div v-else-if="error || !data?.success" class="bg-white p-16 rounded-3xl shadow-sm border border-red-100 text-center">
          <div class="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <UIcon name="i-lucide-x-circle" class="w-10 h-10" />
          </div>
          <h2 class="text-2xl font-black text-gray-900 mb-2">Narudžba nije pronađena</h2>
          <p class="text-gray-500 text-lg">Molimo provjerite je li link koji ste dobili točan i potpun.</p>
        </div>

        <!-- SADRŽAJ NARUDŽBE -->
        <div v-else-if="data?.order" class="space-y-8 animate-fade-in">

          <!-- 1. VIZUALNI STEPPER STATUSA -->
          <div class="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 sm:p-10 relative overflow-hidden">
            <h2 class="text-xl font-bold text-gray-900 mb-10 text-center sm:text-left">Tijek isporuke</h2>

            <div class="relative max-w-3xl mx-auto">
              <!-- Background linija -->
              <div class="absolute left-6 top-0 bottom-0 w-1 bg-gray-100 sm:left-0 sm:top-1/2 sm:-mt-0.5 sm:bottom-auto sm:w-full sm:h-1 z-0 rounded-full"></div>

              <!-- Popunjena linija -->
              <div class="hidden sm:block absolute left-0 top-1/2 -mt-0.5 h-1 bg-yellow-400 rounded-full z-0 transition-all duration-700 ease-out"
                   :style="{ width: `${(currentStatusIndex / (statuses.length - 1)) * 100}%` }">
              </div>

              <div class="relative z-10 flex flex-col sm:flex-row justify-between gap-10 sm:gap-0">
                <div v-for="(status, index) in statuses" :key="status.key" class="relative flex sm:flex-col items-center gap-4 sm:gap-3 group">

                  <!-- Krug s ikonom -->
                  <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-4 border-white flex items-center justify-center z-10 shrink-0 transition-all duration-500"
                       :class="[
                         index < currentStatusIndex ? 'bg-gray-900 text-white' : '',
                         index === currentStatusIndex ? 'bg-yellow-400 text-gray-900 shadow-lg ring-4 ring-yellow-50 scale-110' : '',
                         index > currentStatusIndex ? 'bg-gray-100 text-gray-300' : ''
                       ]">
                    <UIcon v-if="index < currentStatusIndex" name="i-lucide-check" class="w-6 h-6" />
                    <UIcon v-else :name="status.icon" class="w-6 h-6" />
                  </div>

                  <!-- Tekst statusa -->
                  <div class="sm:text-center flex-1">
                    <p class="text-base sm:text-sm font-bold transition-colors" :class="index <= currentStatusIndex ? 'text-gray-900' : 'text-gray-400'">
                      {{ status.label }}
                    </p>
                    <p v-if="index === currentStatusIndex" class="text-xs text-yellow-700 font-bold mt-1 bg-yellow-50 inline-block px-2.5 py-0.5 rounded-md border border-yellow-200">
                      Trenutni status
                    </p>
                  </div>

                </div>
              </div>
            </div>
          </div>

          <!-- 2. FORMA ZA PIN (Prikazuje se samo ako nije upisan i ako nije još preuzeto) -->
          <div v-if="!isPinProvided && (data.order.status === 'NOVO' || data.order.status === 'U_OBRADI')" class="bg-yellow-50 border border-yellow-300 rounded-3xl p-6 sm:p-10 shadow-md relative overflow-hidden">
            <div class="absolute -right-10 -top-10 opacity-10 pointer-events-none">
              <UIcon name="i-lucide-key" class="w-64 h-64 text-yellow-600" />
            </div>

            <div class="relative z-10 flex flex-col md:flex-row gap-8 items-center">
              <div class="flex-1 text-center md:text-left">
                <div class="inline-flex w-12 h-12 bg-yellow-400 text-gray-900 rounded-2xl items-center justify-center mb-4 shadow-sm">
                  <UIcon name="i-lucide-unlock" class="w-6 h-6" />
                </div>
                <h3 class="text-2xl font-black text-gray-900 mb-2">Podaci iz Paketomata</h3>
                <p class="text-yellow-800 font-medium">Kada obavite kupnju, IKEA će Vam poslati SMS s oznakom ormarića i PIN-om. <strong>Upišite ih ovdje</strong> kako bismo mogli preuzeti robu za Vas.</p>
              </div>

              <div class="w-full md:w-[400px] shrink-0">
                <UAlert v-if="pinError" icon="i-lucide-alert-circle" color="red" variant="soft" :title="pinError" class="mb-4 font-bold" />

                <div v-if="pinSuccess" class="bg-green-100 text-green-800 p-6 rounded-2xl font-bold flex flex-col items-center justify-center text-center gap-2 border border-green-200">
                  <UIcon name="i-lucide-check-circle" class="w-10 h-10 text-green-600 mb-2" />
                  Sve je spremljeno!<br/>Zahvaljujemo na podacima.
                </div>

                <form v-else @submit.prevent="submitLockerData" class="space-y-4 bg-white p-6 rounded-3xl border border-yellow-200 shadow-xl">
                  <UFormField label="Oznaka ormarića" required>
                    <UInput v-model="lockerLocation" placeholder="Npr. A, B, C, 12..." size="xl" icon="i-lucide-box" class="w-full text-lg uppercase font-bold" />
                  </UFormField>

                  <UFormField label="PIN za otključavanje" required>
                    <UInput v-model="lockerPin" placeholder="Vaš PIN" size="xl" icon="i-lucide-lock" class="w-full font-mono text-lg font-bold tracking-widest" />
                  </UFormField>

                  <UButton type="submit" block style="background-color: #facc15; color: #000;" size="xl" class="font-black shadow-md mt-4 hover:-translate-y-0.5 transition-transform" :loading="isSubmittingPin">
                    Pošalji podatke vozaču
                  </UButton>
                </form>
              </div>
            </div>
          </div>

          <!-- Prikaz zahvale ako je PIN uspješno poslan -->
          <div v-else-if="isPinProvided" class="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 sm:p-6 flex items-start sm:items-center gap-4 text-emerald-800 shadow-sm">
            <UIcon name="i-lucide-shield-check" class="w-10 h-10 shrink-0 text-emerald-600" />
            <div>
              <h3 class="font-bold text-lg leading-tight mb-1">Podaci za preuzimanje iz ormarića {{ data.order.ikeaDetails?.lockerLocation }} su zaprimljeni!</h3>
              <p class="text-sm opacity-90 font-medium">Sve imamo. Robu iz paketomata preuzimamo i dovozimo na adresu prema planiranom rasporedu.</p>
            </div>
          </div>

          <!-- 3. GLAVNE INFORMACIJE (GRID) -->
          <div class="grid sm:grid-cols-2 gap-6">

            <!-- DATUM I ADRESA -->
            <div class="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <UIcon name="i-lucide-calendar-days" class="w-4 h-4 text-blue-500" /> Termin dostave
                </h3>
                <p class="text-xl sm:text-2xl font-black text-gray-900 capitalize leading-tight mb-8">{{ formattedDate }}</p>
              </div>

              <div class="pt-6 border-t border-gray-100">
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <UIcon name="i-lucide-map-pin" class="w-4 h-4 text-red-500" /> Adresa isporuke
                </h3>
                <p class="font-black text-gray-900 text-lg leading-tight mb-1">{{ data.order.delivery.street }}</p>
                <p class="text-gray-600 font-medium mb-4">{{ data.order.delivery.zip }} {{ data.order.delivery.city }}</p>

                <div v-if="data.order.delivery.notes" class="text-sm text-gray-600 bg-yellow-50/50 p-4 rounded-xl border border-yellow-100 flex gap-3">
                  <UIcon name="i-lucide-message-square" class="w-5 h-5 shrink-0 text-yellow-600" />
                  <span class="italic font-medium">"{{ data.order.delivery.notes }}"</span>
                </div>
              </div>
            </div>

            <!-- CIJENA I DETALJI (TAMNA KARTICA) -->
            <div class="bg-gray-900 rounded-3xl shadow-xl border border-gray-800 p-6 sm:p-8 text-white relative overflow-hidden flex flex-col justify-between">
              <div class="absolute top-0 right-0 w-48 h-48 bg-yellow-400 rounded-bl-full opacity-10 pointer-events-none"></div>

              <div class="relative z-10 mb-8">
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Cijena prijevoza</h3>
                <div class="flex items-end gap-3">
                  <span class="text-5xl font-black text-yellow-400 tracking-tighter">{{ data.order.transport.price }} €</span>
                  <span class="text-gray-400 mb-2 text-sm font-bold uppercase tracking-wider">za naplatu</span>
                </div>
                <p class="text-xs text-gray-500 mt-2">* Plaćanje se vrši gotovinom prilikom preuzimanja robe.</p>
              </div>

              <ul class="space-y-4 text-sm text-gray-300 relative z-10 bg-gray-800/50 p-5 rounded-2xl border border-gray-700/50">
                <li class="flex justify-between items-center border-b border-gray-700/50 pb-3">
                  <span class="font-medium text-gray-400">Usluga istovara:</span>
                  <strong class="text-white bg-gray-800 px-2.5 py-1 rounded-lg uppercase tracking-wider text-xs">
                    {{ data.order.delivery.option === 'room' ? 'Unos u prostor' : 'Do prilaza' }}
                  </strong>
                </li>
                <li class="flex justify-between items-center border-b border-gray-700/50 pb-3">
                  <span class="font-medium text-gray-400">Ukupna težina:</span>
                  <strong class="text-white">{{ data.order.transport.totalWeight }} kg</strong>
                </li>
                <li class="flex justify-between items-center">
                  <span class="font-medium text-gray-400">Broj paketa:</span>
                  <strong class="text-white">{{ data.order.transport.totalBoxes }} kom</strong>
                </li>
              </ul>
            </div>
          </div>

          <!-- 4. POPIS ARTIKALA -->
          <div v-if="data.order.transport?.items && data.order.transport.items.length > 0" class="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="bg-gray-50 px-6 sm:px-8 py-5 border-b border-gray-200">
              <h3 class="text-base font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <UIcon name="i-lucide-shopping-bag" class="w-5 h-5 text-gray-400" /> Naručeni artikli
              </h3>
            </div>

            <div class="p-6 sm:p-8">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-for="item in data.order.transport.items" :key="item.code" class="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/30 hover:bg-gray-50 transition-colors">

                  <img v-if="item.image" :src="item.image" :alt="item.name" class="w-16 h-16 object-contain rounded-xl border border-gray-200 bg-white shadow-sm shrink-0 p-1" />
                  <div v-else class="w-16 h-16 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center shrink-0 text-gray-400">
                    <UIcon name="i-lucide-image" class="w-6 h-6" />
                  </div>

                  <div class="min-w-0 flex-1">
                    <h4 class="font-black text-gray-900 truncate text-base">{{ item.name }}</h4>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="font-mono text-[10px] font-bold text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-sm">{{ item.code }}</span>
                      <span class="text-xs text-gray-500 font-bold bg-gray-200/50 px-2 py-0.5 rounded">📦 {{ item.totalBoxes }} kom</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          <!-- PODRŠKA -->
          <div class="bg-blue-50 rounded-3xl p-6 sm:p-8 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left shadow-sm">
            <div>
              <h4 class="font-black text-xl text-blue-900 mb-1">Pitanja u vezi dostave?</h4>
              <p class="text-sm font-medium text-blue-700">Vozač će Vas u pravilu nazvati 30 minuta prije dolaska na Vašu adresu.</p>
            </div>
            <UButton color="black" variant="solid" icon="i-lucide-phone-call" to="tel:0912345678" size="xl" class="font-bold shadow-md shrink-0 px-6">
              Nazovi podršku
            </UButton>
          </div>

        </div>
      </div>
    </main>

    <!-- ZAJEDNIČKI FOOTER -->
    <AppFooter />
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
