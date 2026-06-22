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
  { key: 'NOVO', label: 'Zaprimljeno', icon: 'i-lucide-inbox', color: 'text-gray-500', bg: 'bg-gray-500' },
  { key: 'U_OBRADI', label: 'U obradi', icon: 'i-lucide-loader-2', color: 'text-yellow-500', bg: 'bg-yellow-500' },
  { key: 'NA_PUTU_DO_IKEA', label: 'Slijedi utovar', icon: 'i-lucide-truck', color: 'text-blue-500', bg: 'bg-blue-500' },
  { key: 'PREUZETO', label: 'Na putu prema Vama', icon: 'i-lucide-package-check', color: 'text-purple-500', bg: 'bg-purple-500' },
  { key: 'DOSTAVLJENO', label: 'Dostavljeno', icon: 'i-lucide-check-circle-2', color: 'text-green-500', bg: 'bg-green-500' }
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
        // Šaljemo očišćenu oznaku u bazu (npr. uvijek veliko "A")
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
  <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
    <div class="max-w-3xl mx-auto">

      <div class="text-center mb-8">
        <h1 class="text-3xl font-black text-gray-900 tracking-tight">Status dostave</h1>
        <p class="text-gray-500 mt-2 font-mono text-sm">Narudžba: {{ orderId }}</p>
      </div>

      <div v-if="pending" class="flex flex-col items-center justify-center bg-white p-12 rounded-3xl shadow-sm border border-gray-100">
        <UIcon name="i-lucide-loader-2" class="w-10 h-10 text-yellow-500 animate-spin mb-4" />
        <p class="text-gray-500 font-medium">Učitavam detalje narudžbe...</p>
      </div>

      <div v-else-if="error || !data?.success" class="bg-white p-12 rounded-3xl shadow-sm border border-red-100 text-center">
        <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-lucide-x-circle" class="w-8 h-8" />
        </div>
        <h2 class="text-xl font-bold text-gray-900 mb-2">Narudžba nije pronađena</h2>
        <p class="text-gray-500">Provjerite je li link koji ste otvorili točan i potpun.</p>
      </div>

      <div v-else-if="data?.order" class="space-y-6">

        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 overflow-hidden relative">
          <h2 class="text-lg font-bold text-gray-900 mb-6">Tijek isporuke</h2>

          <div class="relative">
            <div class="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-100 sm:left-1/2 sm:-ml-px sm:top-6 sm:bottom-auto sm:w-full sm:h-0.5 sm:left-0 sm:right-0"></div>

            <div class="relative flex flex-col sm:flex-row justify-between gap-6 sm:gap-0">
              <div v-for="(status, index) in statuses" :key="status.key" class="relative flex sm:flex-col items-start sm:items-center gap-4 sm:gap-2">

                <div
                  class="w-12 h-12 rounded-full border-4 border-white flex items-center justify-center z-10 shrink-0 transition-colors duration-500"
                  :class="index <= currentStatusIndex ? status.bg + ' text-white shadow-md' : 'bg-gray-100 text-gray-400'"
                >
                  <UIcon :name="status.icon" class="w-5 h-5" />
                </div>

                <div class="sm:text-center pt-2 sm:pt-0">
                  <p class="text-sm font-bold" :class="index <= currentStatusIndex ? 'text-gray-900' : 'text-gray-400'">
                    {{ status.label }}
                  </p>
                  <p v-if="index === currentStatusIndex" class="text-xs text-yellow-600 font-bold mt-1 bg-yellow-50 inline-block px-2 py-0.5 rounded-full">
                    Trenutni status
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>

        <div v-if="!isPinProvided && (data.order.status === 'NOVO' || data.order.status === 'U_OBRADI')" class="bg-yellow-50 border border-yellow-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-yellow-200 text-yellow-700 rounded-full flex items-center justify-center shrink-0">
              <UIcon name="i-lucide-key" class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-lg font-black text-gray-900">Podaci za preuzimanje iz Paketomata</h3>
              <p class="text-sm text-yellow-800">Molimo upišite oznaku ormarića i pristupni PIN iz SMS poruke koju vam je poslala IKEA.</p>
            </div>
          </div>

          <UAlert v-if="pinError" icon="i-lucide-alert-circle" color="red" variant="soft" :title="pinError" class="mb-4 font-medium" />

          <div v-if="pinSuccess" class="bg-green-100 text-green-800 p-4 rounded-xl font-bold flex items-center gap-2">
            <UIcon name="i-lucide-check-circle" class="w-5 h-5" /> Hvala Vam! Podaci su uspješno spremljeni.
          </div>

          <form v-else @submit.prevent="submitLockerData" class="space-y-4 bg-white p-5 rounded-2xl border border-yellow-100 shadow-inner">

            <UFormField label="Oznaka paketomata / ormarića" required>
              <UInput
                v-model="lockerLocation"
                placeholder="Npr. A, B, C, 12..."
                size="xl"
                icon="i-lucide-box"
                class="w-full text-lg uppercase font-bold"
              />
            </UFormField>

            <UFormField label="PIN za otključavanje ormarića" required>
              <UInput
                v-model="lockerPin"
                placeholder="Unesite PIN za preuzimanje"
                size="xl"
                icon="i-lucide-lock"
                class="w-full font-mono text-lg"
              />
            </UFormField>

            <UButton
              type="submit"
              block
              style="background-color: #facc15; color: #000;"
              size="xl"
              class="font-black shadow-md mt-2"
              :loading="isSubmittingPin"
            >
              Pošalji podatke vozaču
            </UButton>
          </form>
        </div>

        <div v-else-if="isPinProvided" class="bg-emerald-50 border border-emerald-200 rounded-3xl p-4 sm:p-6 flex items-start sm:items-center gap-4 text-emerald-800">
          <UIcon name="i-lucide-shield-check" class="w-8 h-8 shrink-0 text-emerald-600" />
          <div>
            <h3 class="font-bold">Podaci za paketomat (Ormarić {{ data.order.ikeaDetails?.lockerLocation }}) su uspješno zaprimljeni!</h3>
            <p class="text-sm opacity-90 mt-0.5">Sve imamo. Robu iz paketomata preuzimamo prema planiranom rasporedu isporuke.</p>
          </div>
        </div>

        <div class="grid sm:grid-cols-2 gap-6">

          <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <UIcon name="i-lucide-calendar-days" class="w-4 h-4" /> Termin dostave
            </h3>
            <p class="text-lg font-black text-gray-900 capitalize">{{ formattedDate }}</p>

            <div class="mt-6 pt-6 border-t border-gray-100">
              <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <UIcon name="i-lucide-map-pin" class="w-4 h-4" /> Adresa isporuke
              </h3>
              <p class="font-bold text-gray-900">{{ data.order.delivery.street }}</p>
              <p class="text-gray-600">{{ data.order.delivery.zip }} {{ data.order.delivery.city }}</p>
              <p v-if="data.order.delivery.notes" class="mt-3 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <strong class="text-gray-700">Napomena:</strong> {{ data.order.delivery.notes }}
              </p>
            </div>
          </div>

          <div class="bg-gray-900 rounded-3xl shadow-xl border border-gray-800 p-6 sm:p-8 text-white relative overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-yellow-400 rounded-bl-full opacity-10"></div>

            <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Usluga prijevoza</h3>
            <div class="flex items-end gap-2 mb-6">
              <span class="text-4xl font-black text-yellow-400">{{ data.order.transport.price }} €</span>
              <span class="text-gray-400 mb-1 text-sm font-medium">za naplatu</span>
            </div>

            <ul class="space-y-3 text-sm text-gray-300">
              <li class="flex justify-between items-center border-b border-gray-800 pb-2">
                <span>Tip isporuke:</span>
                <strong class="text-white capitalize">{{ data.order.delivery.option === 'room' ? 'Unos u prostoriju' : 'Do kolnog prilaza' }}</strong>
              </li>
              <li class="flex justify-between items-center border-b border-gray-800 pb-2">
                <span>Ukupna težina robe:</span>
                <strong class="text-white">{{ data.order.transport.totalWeight }} kg</strong>
              </li>
              <li class="flex justify-between items-center border-b border-gray-800 pb-2">
                <span>Broj transportnih paketa:</span>
                <strong class="text-white">{{ data.order.transport.totalBoxes }} kom</strong>
              </li>
            </ul>
          </div>
        </div>

        <div v-if="data.order.transport?.items && data.order.transport.items.length > 0" class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <UIcon name="i-lucide-shopping-bag" class="w-4 h-4" /> Naručeni artikli
          </h3>

          <div class="space-y-3">
            <div v-for="item in data.order.transport.items" :key="item.code" class="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">

              <div class="flex items-center gap-4 flex-1 min-w-0">
                <img v-if="item.image" :src="item.image" :alt="item.name" class="w-16 h-16 object-contain rounded-xl border border-gray-200 bg-white shadow-sm shrink-0" />
                <div v-else class="w-16 h-16 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center shrink-0 text-gray-400">
                  <UIcon name="i-lucide-image" class="w-6 h-6" />
                </div>

                <div class="min-w-0">
                  <h4 class="font-bold text-gray-900 truncate">{{ item.name }}</h4>
                  <div class="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                    <span class="font-mono text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-200 shadow-sm">{{ item.code }}</span>
                    <span class="text-gray-600 font-medium flex items-center gap-1">
                      <UIcon name="i-lucide-package" class="w-3.5 h-3.5"/> {{ item.totalBoxes }} paketa
                    </span>
                  </div>
                </div>
              </div>

              <div class="text-left sm:text-right shrink-0 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                <p class="font-black text-gray-900">{{ item.price }} €</p>
              </div>

            </div>
          </div>
        </div>

        <div class="bg-blue-50 rounded-2xl p-4 sm:p-6 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 class="font-bold text-blue-900">Imate pitanja u vezi dostave?</h4>
            <p class="text-sm text-blue-700 mt-1">Vaš vozač će Vas kontaktirati prije dolaska na adresu.</p>
          </div>
          <UButton
            color="white"
            variant="solid"
            icon="i-lucide-phone"
            to="tel:0912345678"
            class="font-bold shadow-sm shrink-0"
          >
            Nazovi podršku
          </UButton>
        </div>

      </div>
    </div>
  </div>
</template>
