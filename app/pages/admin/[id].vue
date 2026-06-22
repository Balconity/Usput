<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, computed } from 'vue'

const route = useRoute()
const orderId = route.params.id

const { data, pending, error, refresh } = await useFetch(`/api/admin/orders/${orderId}`)

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

// --- LOGIKA ZA PROMJENU STATUSA (LINEARNI TIJEK) ---
const isUpdating = ref(false)

const availableStatuses = [
  { value: 'NOVO', label: 'NOVO (Zaprimljeno)', color: 'gray' },
  { value: 'U_OBRADI', label: 'U OBRADI (Čeka se PIN)', color: 'yellow' },
  { value: 'NA_PUTU_DO_IKEA', label: 'NA PUTU DO IKEA-e (Slijedi utovar)', color: 'blue' },
  { value: 'PREUZETO', label: 'PREUZETO (Na putu do kupca)', color: 'purple' },
  { value: 'DOSTAVLJENO', label: 'DOSTAVLJENO (Završeno)', color: 'green' }
]

const currentStatusValue = computed(() => data.value?.order?.status || 'NOVO')

const currentBadgeColor = computed(() => {
  const match = availableStatuses.find(s => s.value === currentStatusValue.value)
  return match ? match.color : 'gray'
})

// Pronalazak SLJEDEĆEG statusa u nizu
const nextStatusAction = computed(() => {
  const currentIndex = availableStatuses.findIndex(s => s.value === currentStatusValue.value)
  // Ako smo na zadnjem statusu (DOSTAVLJENO), nema idućeg koraka
  if (currentIndex === -1 || currentIndex === availableStatuses.length - 1) {
    return null
  }
  return availableStatuses[currentIndex + 1]
})

// Funkcija koja ažurira status na sljedeći
async function updateToNextStatus() {
  if (!nextStatusAction.value) return
  isUpdating.value = true

  try {
    await $fetch(`/api/admin/orders/${orderId}`, {
      method: 'PUT',
      body: { status: nextStatusAction.value.value }
    })

    // Ponovno povuci podatke iz baze da se ekran osvježi
    await refresh()

  } catch (err) {
    alert('Došlo je do greške prilikom promjene statusa.')
    console.error(err)
  } finally {
    isUpdating.value = false
  }
}
</script>

<template>
  <div class="max-w-5xl mx-auto py-8 px-4 sm:px-6">

    <div v-if="pending" class="py-20 flex flex-col items-center justify-center text-gray-500">
      <UIcon name="i-lucide-loader-2" class="w-10 h-10 animate-spin mb-4" />
      <p class="font-medium text-lg">Učitavam detalje narudžbe...</p>
    </div>

    <UAlert
      v-else-if="error"
      icon="i-lucide-alert-circle"
      color="red"
      variant="soft"
      title="Greška"
      description="Narudžba nije pronađena ili se dogodila greška na serveru."
    />

    <div v-else-if="data?.order" class="space-y-6">

      <!-- ZAGLAVLJE -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <UButton to="/admin/dashboard" color="gray" variant="ghost" icon="i-lucide-arrow-left" class="mb-4 -ml-2 font-bold">
            Nazad na popis
          </UButton>
          <div class="flex items-center gap-3 mb-1">
            <h1 class="text-3xl font-black text-gray-900">Narudžba</h1>
            <UBadge :color="currentBadgeColor" size="lg" class="font-bold uppercase tracking-wider">
              {{ currentStatusValue }}
            </UBadge>
          </div>
          <p class="text-sm font-mono text-gray-500">{{ data.order.PK.replace('ORDER#', '') }}</p>
        </div>
        <div class="text-right bg-blue-50 text-blue-900 px-5 py-3 rounded-2xl border border-blue-200 shadow-sm">
          <p class="text-xs font-bold uppercase tracking-wider text-blue-600 mb-0.5">Za naplatu kupcu</p>
          <p class="text-3xl font-black">{{ data.order.transport.price }} €</p>
        </div>
      </div>

      <!-- KONTROLA STATUSA (BEZ SELECTA, SAMO GUMB ZA SLJEDEĆI KORAK) -->
      <div class="shadow-sm border border-gray-200 rounded-xl p-5 border-l-4" :class="`border-l-${currentBadgeColor}-500 bg-${currentBadgeColor}-50`">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 class="font-bold text-gray-900">Napredak pošiljke</h3>
            <p class="text-sm text-gray-600">Prelazak u sljedeću fazu automatski se prikazuje kupcu.</p>
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto">
            <!-- Prikazuje gumb samo ako postoji idući status -->
            <UButton
              v-if="nextStatusAction"
              color="black"
              size="lg"
              icon="i-lucide-arrow-right"
              trailing
              :loading="isUpdating"
              @click="updateToNextStatus"
            >
              Promijeni u: {{ nextStatusAction.label }}
            </UButton>

            <!-- Ako smo došli do kraja, ispisujemo poruku -->
            <div v-else class="text-green-700 font-bold flex items-center gap-2 bg-green-100 px-4 py-2 rounded-lg">
              <UIcon name="i-lucide-check-circle" class="w-6 h-6" /> Isporuka je završena
            </div>
          </div>
        </div>
      </div>

      <!-- GLAVNE INFORMACIJE -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

        <UCard class="shadow-sm ring-1 ring-gray-200">
          <template #header><h3 class="font-bold text-lg flex items-center gap-2"><UIcon name="i-lucide-user" class="text-gray-400"/> Kupac i Kontakt</h3></template>
          <div class="space-y-3 text-sm">
            <p><span class="text-gray-500 w-24 inline-block">Ime:</span> <strong class="text-gray-900">{{ data.order.personalInfo.name }}</strong></p>
            <p><span class="text-gray-500 w-24 inline-block">Mobitel:</span> <a :href="`tel:${data.order.personalInfo.phone}`" class="text-blue-600 font-bold underline">{{ data.order.personalInfo.phone }}</a></p>
            <p><span class="text-gray-500 w-24 inline-block">Email:</span> <a :href="`mailto:${data.order.personalInfo.email}`" class="text-blue-600 font-bold underline">{{ data.order.personalInfo.email }}</a></p>
            <p><span class="text-gray-500 w-24 inline-block">Naručeno:</span> <span class="font-medium">{{ formatDate(data.order.createdAt) }}</span></p>
          </div>
        </UCard>

        <UCard class="shadow-sm ring-1 ring-gray-200">
          <template #header><h3 class="font-bold text-lg flex items-center gap-2"><UIcon name="i-lucide-truck" class="text-gray-400"/> Isporuka na adresu</h3></template>
          <div class="space-y-3 text-sm">
            <p><span class="text-gray-500 w-28 inline-block">Datum (ZGB):</span> <strong class="text-gray-900 bg-yellow-100 px-2 py-0.5 rounded">{{ new Date(data.order.delivery.date).toLocaleDateString('hr-HR') }}</strong></p>
            <p><span class="text-gray-500 w-28 inline-block">Adresa:</span> <strong class="text-gray-900">{{ data.order.delivery.street }}, {{ data.order.delivery.zip }} {{ data.order.delivery.city }}</strong></p>
            <p><span class="text-gray-500 w-28 inline-block">Tip istovara:</span> <strong class="text-gray-900 uppercase">{{ data.order.delivery.option === 'room' ? 'Unos u prostor' : 'Istovar na prilazu' }}</strong></p>
            <p v-if="data.order.delivery.option === 'room'">
              <span class="text-gray-500 w-28 inline-block">Kat i Lift:</span>
              <strong>{{ data.order.delivery.objectType === 'zgrada' ? `${data.order.delivery.floor}. kat` : 'Kuća' }}</strong>
              <span v-if="data.order.delivery.objectType === 'zgrada'" class="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" :class="data.order.delivery.hasElevator ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                {{ data.order.delivery.hasElevator ? 'Ima lift' : 'Nema lifta' }}
              </span>
            </p>
            <div v-if="data.order.delivery.notes" class="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-yellow-900 italic mt-3 font-medium">
              "{{ data.order.delivery.notes }}"
            </div>
          </div>
        </UCard>

        <UCard class="shadow-sm ring-1 ring-gray-200 md:col-span-2 bg-gray-50">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="bg-blue-600 text-white p-3 rounded-xl shadow-sm"><UIcon name="i-lucide-shopping-cart" class="w-6 h-6" /></div>
              <div>
                <p class="text-xs text-gray-500 font-bold uppercase tracking-wider">IKEA Broj Narudžbe:</p>
                <p class="text-2xl font-black text-gray-900 tracking-wider">{{ data.order.ikeaDetails.orderNumber }}</p>
              </div>
            </div>
            <div class="text-sm sm:text-right">
              <p><span class="text-gray-500">IKEA E-mail:</span> <strong>{{ data.order.ikeaDetails.ikeaEmail }}</strong></p>
              <UButton :to="data.order.ikeaDetails.listUrl" target="_blank" color="blue" variant="soft" size="xs" class="mt-2 font-bold" trailing-icon="i-lucide-external-link">
                Otvori IKEA košaricu kupca
              </UButton>
            </div>
          </div>
        </UCard>
      </div>

      <!-- DETALJI TRANSPORTA I PAKETA -->
      <div class="mt-10 shadow-lg rounded-2xl overflow-hidden border border-gray-200">
        <div class="bg-gray-900 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between text-white gap-4">
          <h2 class="text-xl font-bold flex items-center gap-2">
            <UIcon name="i-lucide-package" class="w-6 h-6 text-yellow-400" />
            Popis tereta za utovar
          </h2>
          <div class="flex flex-wrap gap-2 text-sm font-bold">
            <span class="bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">Kutija: <span class="text-yellow-400">{{ data.order.transport.totalBoxes }}</span></span>
            <span class="bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">Težina: <span class="text-yellow-400">{{ data.order.transport.totalWeight }} kg</span></span>
            <span class="bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">Volumen: <span class="text-yellow-400">{{ data.order.transport.totalVolume }} m³</span></span>
          </div>
        </div>

        <div class="bg-white p-4 sm:p-6 space-y-4">
          <div v-for="group in data.order.transport.items" :key="group.code" class="border border-gray-200 rounded-xl overflow-hidden shadow-sm">

            <div class="bg-gray-50 px-4 py-3 flex items-center gap-3 border-b border-gray-200">
              <img v-if="group.image" :src="group.image" class="w-12 h-12 rounded border bg-white object-contain shadow-sm" />
              <div v-else class="w-12 h-12 rounded border bg-gray-200 flex items-center justify-center text-gray-400">
                <UIcon name="i-lucide-image" class="w-6 h-6" />
              </div>
              <div>
                <h4 class="font-black text-gray-900 text-base leading-tight">{{ group.name }}</h4>
                <p class="text-xs text-gray-500 font-mono mt-0.5">{{ group.code }}</p>
              </div>
            </div>

            <ul class="divide-y divide-gray-100">
              <li v-for="pkg in group.packages" :key="pkg.code" class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-yellow-50/50 transition-colors">
                <div class="text-sm min-w-0">
                  <p class="font-bold text-gray-800">{{ pkg.name }}</p>
                  <p class="text-[10px] text-gray-400 font-mono tracking-wider mt-0.5">ŠIFRA: {{ pkg.code }}</p>
                </div>

                <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                  <div>
                    <p class="text-[9px] font-bold text-gray-400 uppercase">Dimenzije (cm)</p>
                    <p class="font-mono text-gray-700 font-medium">{{ pkg.dimensions.length }} × {{ pkg.dimensions.width }} × {{ pkg.dimensions.height }}</p>
                  </div>
                  <div class="w-16">
                    <p class="text-[9px] font-bold text-gray-400 uppercase">Težina</p>
                    <p class="font-black text-amber-700">{{ (pkg.dimensions.weight * pkg.quantity).toFixed(2) }} kg</p>
                  </div>
                  <div class="w-16">
                    <p class="text-[9px] font-bold text-gray-400 uppercase">Volumen</p>
                    <p class="font-black text-sky-700">{{ (pkg.dimensions.volume * pkg.quantity).toFixed(3) }} m³</p>
                  </div>
                  <div class="font-black bg-white shadow-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-900 shrink-0 ml-auto sm:ml-0">
                    {{ pkg.quantity }} kom
                  </div>
                </div>
              </li>
            </ul>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>
