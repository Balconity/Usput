<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// --- STANJA UČITAVANJA ---
const isProcessing = ref(false)

// --- FORMA ZA DOSTAVU ---
const form = ref({
  fullName: 'Ivan Horvat', // U produkciji ovo povlačimo iz Cognito sesije
  phone: '+385 91 234 5678',
  address: '',
  city: 'Varaždin',
  floor: '',
  hasElevator: false,
  notes: '',
  paymentMethod: 'card' // card | cash
})

// --- MOCK PODACI IZ KALKULATORA ---
const cartSummary = ref({
  itemsCount: 5,
  volume: 1.25,
  weight: 85.0,
  deliveryPrice: 65.00,
  items: [
    { name: 'KALLAX Regal', quantity: 2 },
    { name: 'MALM Komoda', quantity: 1 },
    { name: 'MARKUS Stolica', quantity: 2 }
  ]
})

// --- GRADOVI ZA DOSTAVU ---
const cityOptions = [
  { label: 'Varaždin', value: 'Varaždin' },
  { label: 'Novi Marof', value: 'Novi Marof' },
  { label: 'Zagreb (Istok)', value: 'Zagreb (Istok)' }
]

// --- LOGIKA ZA ZAVRŠETAK NARUDŽBE ---
async function handleSubmit() {
  if (!form.value.address || !form.value.city) {
    alert('Molimo unesite adresu i grad isporuke.')
    return
  }

  isProcessing.value = true

  try {
    // Simulacija slanja na backend i procesiranja
    await new Promise(resolve => setTimeout(resolve, 1500))

    alert('Narudžba uspješno kreirana!')
    router.push('/profile')
  } catch (error) {
    console.error(error)
    alert('Došlo je do greške. Pokušajte ponovno.')
  } finally {
    isProcessing.value = false
  }
}

// Pomoćna funkcija za formatiranje cijene
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('hr-HR', { style: 'currency', currency: 'EUR' }).format(price)
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 font-sans text-neutral-900 pb-20">

    <header class="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm w-full">
      <div class="w-full max-w-[1400px] mx-auto flex items-center justify-between py-4 px-4 sm:px-6 lg:px-8">
        <NuxtLink to="/" class="flex items-center gap-2 text-xl font-bold hover:opacity-80 transition-opacity shrink-0">
          <span>Usput<span class="text-yellow-500">.</span></span>
        </NuxtLink>
        <div class="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest shrink-0">
          <UIcon name="i-lucide-lock" class="w-4 h-4" /> Sigurna naplata
        </div>
      </div>
    </header>

    <main class="pt-8 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-[1400px] mx-auto">

        <div class="mb-10 text-center sm:text-left">
          <h1 class="text-3xl font-extrabold text-gray-950 mb-2">Finalizacija dostave namještaja</h1>
          <p class="text-gray-600">Unesite precizne detalje kako bismo osigurali brzu i sigurnu isporuku.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start w-full">

          <div class="lg:col-span-8 space-y-8 w-full">

            <UCard class="shadow-sm border border-gray-200 rounded-2xl bg-white w-full" :ui="{ body: { padding: 'p-0' } }">
              <div class="p-8 space-y-8">
                <h2 class="text-xl font-bold text-gray-950 flex items-center gap-3 mb-6 border-b border-gray-100 pb-5">
                  <UIcon name="i-lucide-map-pin" class="w-6 h-6 text-yellow-500" />
                  1. Točna lokacija isporuke
                </h2>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                  <div class="w-full space-y-2 sm:col-span-2">
                    <label class="block text-sm font-bold text-gray-800">Ulica i kućni broj <span class="text-red-500">*</span></label>
                    <UInput v-model="form.address" placeholder="Npr. Zagrebačka ulica 15" size="xl" icon="i-lucide-home" class="w-full mt-1" />
                  </div>

                  <div class="w-full space-y-2">
                    <label class="block text-sm font-bold text-gray-800">Grad dostave <span class="text-red-500">*</span></label>
                    <USelect v-model="form.city" :options="cityOptions" size="xl" class="w-full mt-1" />
                  </div>

                  <div class="w-full space-y-2">
                    <label class="block text-sm font-bold text-gray-800">Kat / Broj stana (opcionalno)</label>
                    <UInput v-model="form.floor" placeholder="Npr. 3. kat, stan 12" size="xl" icon="i-lucide-building" class="w-full mt-1" />
                  </div>
                </div>

                <div class="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 mt-6 shadow-inner">
                  <div>
                    <p class="text-sm font-bold text-gray-950">Zgrada ima dizalo (lift)?</p>
                    <p class="text-xs text-gray-500 mt-0.5">Ovo je presudno za organizaciju nošenja teškog namještaja.</p>
                  </div>
                  <UToggle v-model="form.hasElevator" color="yellow" size="lg" />
                </div>
              </div>
            </UCard>

            <UCard class="shadow-sm border border-gray-200 rounded-2xl bg-white w-full" :ui="{ body: { padding: 'p-0' } }">
              <div class="p-8 space-y-8">
                <h2 class="text-xl font-bold text-gray-950 flex items-center gap-3 mb-6 border-b border-gray-100 pb-5">
                  <UIcon name="i-lucide-phone" class="w-6 h-6 text-yellow-500" />
                  2. Kontakt i napomene vozaču
                </h2>

                <div class="space-y-6 w-full">
                  <div class="w-full space-y-2">
                    <label class="block text-sm font-bold text-gray-800">Kontakt broj za vozača Krunu <span class="text-red-500">*</span></label>
                    <UInput v-model="form.phone" type="tel" size="xl" icon="i-lucide-smartphone" class="w-full mt-1" />
                  </div>

                  <div class="w-full space-y-2">
                    <label class="block text-sm font-bold text-gray-800">Važna napomena (Opcionalno)</label>
                    <UTextarea v-model="form.notes" placeholder="Npr. Pas je u dvorištu ali je svezan. Zvonite na portafon prezime Horvat." :rows="3" size="lg" class="w-full mt-1" />
                  </div>
                </div>
              </div>
            </UCard>

            <UCard class="shadow-sm border border-gray-200 rounded-2xl bg-white w-full overflow-hidden" :ui="{ body: { padding: 'p-0' } }">
              <div class="p-8 space-y-8">
                <h2 class="text-xl font-bold text-gray-950 flex items-center gap-3 mb-6 border-b border-gray-100 pb-5">
                  <UIcon name="i-lucide-credit-card" class="w-6 h-6 text-yellow-500" />
                  3. Odabir načina plaćanja
                </h2>

                <div class="space-y-4">
                  <label
                    class="flex items-start gap-5 p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 w-full"
                    :class="form.paymentMethod === 'card' ? 'border-yellow-400 bg-yellow-50/50 shadow-inner' : 'border-gray-200 hover:border-gray-300 bg-white'"
                  >
                    <div class="flex items-center h-6 mt-0.5">
                      <URadio v-model="form.paymentMethod" value="card" color="yellow" />
                    </div>
                    <div class="flex-1 w-full min-w-0">
                      <p class="font-bold text-gray-950 text-base">Kreditna ili debitna kartica</p>
                      <p class="text-sm text-gray-500 mt-1">Sigurno i kriptirano plaćanje putem Stripe sustava.</p>

                      <div v-if="form.paymentMethod === 'card'" class="mt-5 p-5 bg-white border border-gray-200 rounded-xl space-y-3 w-full shadow-sm">
                        <UInput placeholder="Broj kartice" icon="i-lucide-credit-card" class="w-full" disabled />
                        <div class="grid grid-cols-2 gap-3">
                          <UInput placeholder="MM/GG" disabled />
                          <UInput placeholder="CVC" disabled />
                        </div>
                      </div>
                    </div>
                  </label>

                  <label
                    class="flex items-start gap-5 p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 w-full"
                    :class="form.paymentMethod === 'cash' ? 'border-yellow-400 bg-yellow-50/50 shadow-inner' : 'border-gray-200 hover:border-gray-300 bg-white'"
                  >
                    <div class="flex items-center h-6 mt-0.5">
                      <URadio v-model="form.paymentMethod" value="cash" color="yellow" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-bold text-gray-950 text-base">Plaćanje vozaču pri preuzimanju (Gotovina)</p>
                      <p class="text-sm text-gray-500 mt-1">Plaćate dostavljaču gotovinom ili KeksPay-om.</p>
                    </div>
                  </label>
                </div>
              </div>
            </UCard>
          </div>


          <div class="lg:col-span-4 w-full">
            <div class="sticky top-28 space-y-8 w-full">

              <UCard class="shadow-xl border-2 border-gray-950 rounded-3xl bg-gray-950 w-full overflow-hidden text-white" :ui="{ body: { padding: 'p-0' } }">
                <div class="p-8 bg-gray-900/50 border-b border-gray-800 rounded-t-3xl">
                  <h3 class="text-2xl font-black text-white flex items-center gap-3">
                    <UIcon name="i-lucide-receipt" class="w-6 h-6 text-yellow-400" />
                    Vaša košarica
                  </h3>
                </div>

                <div class="p-8">
                  <ul class="space-y-3.5 mb-7">
                    <li v-for="(item, index) in cartSummary.items" :key="index" class="flex justify-between text-sm">
                      <span class="font-medium text-gray-300"><span class="font-black text-white">{{ item.quantity }}x</span> {{ item.name }}</span>
                    </li>
                  </ul>

                  <div class="border-t border-gray-800 pt-5 mb-7 space-y-2.5">
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-400 font-medium flex items-center gap-2"><UIcon name="i-lucide-box" class="w-4 h-4 text-yellow-500" /> Volumen</span>
                      <span class="font-bold text-white">{{ cartSummary.volume }} m³</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-400 font-medium flex items-center gap-2"><UIcon name="i-lucide-scale" class="w-4 h-4 text-yellow-500" /> Težina</span>
                      <span class="font-bold text-white">{{ cartSummary.weight }} kg</span>
                    </div>
                    <div class="flex justify-between text-sm items-center">
                      <span class="text-gray-400 font-medium flex items-center gap-2"><UIcon name="i-lucide-home" class="w-4 h-4 text-yellow-500" /> Unos u prostoriju</span>
                      <UBadge color="green" variant="subtle" class="font-bold text-[10px] tracking-wider uppercase">Uključeno</UBadge>
                    </div>
                  </div>

                  <div class="border-t-2 border-gray-700 pt-5 mb-10">
                    <div class="flex justify-between items-end">
                      <span class="text-base font-bold text-gray-200">Ukupno za dostavu</span>
                      <span class="text-4xl font-black text-yellow-400 tracking-tight">{{ formatPrice(cartSummary.deliveryPrice) }}</span>
                    </div>
                  </div>

                  <UButton
                    block
                    size="xl"
                    :loading="isProcessing"
                    style="background-color: #facc15; color: #000; font-weight: 900; font-size: 1.125rem;"
                    class="hover:bg-yellow-500 transition-all shadow-lg shadow-yellow-400/20 h-16 rounded-2xl scale-100 hover:scale-[1.02] active:scale-95"
                    @click="handleSubmit"
                  >
                    Potvrdi i plati dostavu
                  </UButton>

                  <p class="text-xs text-center text-gray-500 mt-5 px-3 leading-relaxed">
                    Uplatom osiguravate svoj termin dostave i prihvaćate naše <NuxtLink to="/uvjeti-koristenja" target="_blank" class="underline hover:text-gray-300">Uvjete korištenja</NuxtLink>.
                  </p>
                </div>
              </UCard>

              <div class="flex justify-center gap-8 opacity-70 w-full pt-2">
                <div class="flex flex-col items-center gap-1.5">
                  <UIcon name="i-lucide-shield-check" class="w-7 h-7 text-gray-600" />
                  <span class="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Sigurno</span>
                </div>
                <div class="flex flex-col items-center gap-1.5">
                  <UIcon name="i-lucide-truck" class="w-7 h-7 text-gray-600" />
                  <span class="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Brzo</span>
                </div>
                <div class="flex flex-col items-center gap-1.5">
                  <UIcon name="i-lucide-thumbs-up" class="w-7 h-7 text-gray-600" />
                  <span class="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Pouzdano</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </main>
  </div>
</template>
