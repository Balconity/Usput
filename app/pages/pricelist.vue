<script setup lang="ts">
import { ref, computed } from 'vue'

const colorMode = useColorMode()
colorMode.preference = 'light'

// --- SEO OPTIMIZACIJA ---
useHead({
  title: 'Cjenik usluga | Usput Dostava Varaždin',
  meta: [
    { name: 'description', content: 'Provjerite cijene dostave IKEA paketa i namještaja na relaciji Zagreb - Varaždin. Cijene namještaja su 20% povoljnije od službene IKEA Family dostave.' },
    { property: 'og:title', content: 'Cjenik usluga | Usput Dostava' },
    { property: 'og:description', content: 'Transparentan cjenik dostave IKEA namještaja za Varaždin. Cijene su konačne, obrt nije u sustavu PDV-a.' }
  ]
})

// --- DINAMIČKO DOHVAĆANJE CIJENA ---
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

// Pomoćne varijable za formatirani prikaz s 2 decimale
const priceStandard = computed(() => Number(pricing.value.standard).toFixed(2).replace('.', ','))
const priceLarge = computed(() => Number(pricing.value.large).toFixed(2).replace('.', ','))
const priceDriveway = computed(() => Number(pricing.value.driveway100).toFixed(2).replace('.', ','))
const priceRoom400 = computed(() => Number(pricing.value.room400).toFixed(2).replace('.', ','))
const priceRoom600 = computed(() => Number(pricing.value.room600).toFixed(2).replace('.', ','))
const priceRoom1000 = computed(() => Number(pricing.value.room1000).toFixed(2).replace('.', ','))
const priceRoom1400 = computed(() => Number(pricing.value.room1400).toFixed(2).replace('.', ','))
const priceDisposal = computed(() => Number(pricing.value.disposal).toFixed(2).replace('.', ','))

</script>

<template>
  <div class="min-h-screen flex flex-col font-sans bg-gray-50 text-neutral-900 selection:bg-yellow-400 selection:text-black scroll-smooth">
    <AppHeader />

    <main class="flex-grow pt-16 pb-24 lg:pt-24 lg:pb-32 relative overflow-hidden">

      <div class="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-yellow-400/10 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div class="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/5 rounded-full blur-3xl pointer-events-none z-0"></div>

      <UContainer class="relative z-10">

        <div class="text-center max-w-3xl mx-auto mb-20 animate-fade-in">
          <h1 class="text-4xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
            Transparentno i <br/><span class="text-yellow-500">bez skrivenih troškova.</span>
          </h1>
          <p class="text-lg text-gray-600 font-medium leading-relaxed">
            Zadržavamo iste cijene kao službena dostava za male pakete uz puno bržu uslugu, dok na dostavu namještaja nudimo trajnih <strong>20% popusta</strong>.
          </p>
        </div>

        <div class="grid lg:grid-cols-3 gap-8 mb-24 animate-fade-in" style="animation-delay: 0.1s;">

          <div class="bg-white rounded-3xl p-8 lg:p-10 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col relative mt-4 lg:mt-8">
            <h3 class="text-2xl font-black mb-3 text-gray-900">Standardni paket</h3>
            <p class="text-gray-500 mb-8 flex-grow font-medium">Sitnice, dekoracije, posuđe i tekstil.</p>

            <div class="space-y-4 mb-8">
              <div class="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
                <span class="text-gray-500">Maks. težina</span>
                <span class="font-bold text-gray-900">14,99 kg</span>
              </div>
              <div class="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
                <span class="text-gray-500">Maks. dimenzije</span>
                <span class="font-bold text-gray-900">58x38x30 cm</span>
              </div>
            </div>

            <div class="pt-6 border-t border-gray-100">
              <span class="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Cijena kao u IKEA-i</span>
              <p class="text-4xl font-black text-gray-900">{{ priceStandard }} €</p>
            </div>
          </div>

          <div class="bg-gray-900 rounded-3xl p-8 lg:p-10 border border-gray-800 shadow-2xl flex flex-col relative transform lg:-translate-y-4 z-10">
            <div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 text-xs font-black uppercase tracking-widest py-2 px-6 rounded-full shadow-md">
              Najčešći odabir
            </div>

            <h3 class="text-2xl font-black mb-3 text-white mt-4">Do kolnog prilaza</h3>
            <p class="text-gray-400 mb-8 flex-grow font-medium">Srednji namještaj. Isporuka direktno ispred Vaše kuće ili zgrade.</p>

            <div class="space-y-4 mb-8 text-gray-300">
              <div class="flex items-center justify-between text-sm border-b border-gray-800 pb-2">
                <span class="text-gray-500">Maks. težina</span>
                <span class="font-bold text-white">do 100 kg</span>
              </div>
              <div class="flex items-center justify-between text-sm border-b border-gray-800 pb-2">
                <span class="text-gray-500">Ušteda</span>
                <span class="font-bold text-yellow-400">20% popusta</span>
              </div>
            </div>

            <div class="pt-6 border-t border-gray-800">
              <span class="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-1">
                IKEA Zona 2: <span class="line-through">54,99 €</span>
              </span>
              <p class="text-5xl font-black text-yellow-400">{{ priceDriveway }} €</p>
            </div>
          </div>

          <div class="bg-white rounded-3xl p-8 lg:p-10 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col relative mt-4 lg:mt-8">
            <h3 class="text-2xl font-black mb-3 text-gray-900">Veliki paket</h3>
            <p class="text-gray-500 mb-8 flex-grow font-medium">Manje police, stolice, tepisi i manja rasvjeta.</p>

            <div class="space-y-4 mb-8">
              <div class="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
                <span class="text-gray-500">Maks. težina</span>
                <span class="font-bold text-gray-900">29,99 kg</span>
              </div>
              <div class="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
                <span class="text-gray-500">Maks. dimenzije</span>
                <span class="font-bold text-gray-900">80x60x50 cm</span>
              </div>
            </div>

            <div class="pt-6 border-t border-gray-100">
              <span class="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Cijena kao u IKEA-i</span>
              <p class="text-4xl font-black text-gray-900">{{ priceLarge }} €</p>
            </div>
          </div>

        </div>

        <div class="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden mb-16 animate-fade-in" style="animation-delay: 0.2s;">
          <div class="px-8 py-10 lg:px-12 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 class="text-3xl font-black text-gray-900 mb-2">Dostava u prostoriju</h2>
              <p class="text-gray-600 font-medium">Fizički unos teškog namještaja i kuhinja direktno u Vaš dom (na kat ili u kuću).</p>
            </div>
            <div class="shrink-0 bg-yellow-100 text-yellow-800 text-sm font-black uppercase tracking-widest py-2 px-6 rounded-xl border border-yellow-200">
              Zajamčenih 20% popusta
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
              <tr>
                <th class="py-5 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest bg-white border-b border-gray-100">Kategorija težine</th>
                <th class="py-5 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest bg-white border-b border-gray-100 hidden md:table-cell">Redovna IKEA cijena</th>
                <th class="py-5 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest bg-white border-b border-gray-100 hidden sm:table-cell">IKEA Family</th>
                <th class="py-5 px-8 text-xs font-black text-gray-900 uppercase tracking-widest bg-yellow-50 border-b border-yellow-100 w-1/3">Naša cijena</th>
              </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
              <tr class="hover:bg-gray-50 transition-colors group">
                <td class="py-6 px-8 font-bold text-gray-900 text-lg">Do 400 kg</td>
                <td class="py-6 px-8 text-gray-400 font-medium line-through hidden md:table-cell">149,00 €</td>
                <td class="py-6 px-8 text-gray-500 font-medium line-through hidden sm:table-cell">119,00 €</td>
                <td class="py-6 px-8 text-3xl font-black text-gray-900 bg-yellow-50/50 group-hover:bg-yellow-100/50 transition-colors">{{ priceRoom400 }} €</td>
              </tr>
              <tr class="hover:bg-gray-50 transition-colors group">
                <td class="py-6 px-8 font-bold text-gray-900 text-lg">400 kg - 600 kg</td>
                <td class="py-6 px-8 text-gray-400 font-medium line-through hidden md:table-cell">159,00 €</td>
                <td class="py-6 px-8 text-gray-500 font-medium line-through hidden sm:table-cell">129,00 €</td>
                <td class="py-6 px-8 text-3xl font-black text-gray-900 bg-yellow-50/50 group-hover:bg-yellow-100/50 transition-colors">{{ priceRoom600 }} €</td>
              </tr>
              <tr class="hover:bg-gray-50 transition-colors group">
                <td class="py-6 px-8 font-bold text-gray-900 text-lg">600 kg - 1000 kg</td>
                <td class="py-6 px-8 text-gray-400 font-medium line-through hidden md:table-cell">169,00 €</td>
                <td class="py-6 px-8 text-gray-500 font-medium line-through hidden sm:table-cell">139,00 €</td>
                <td class="py-6 px-8 text-3xl font-black text-gray-900 bg-yellow-50/50 group-hover:bg-yellow-100/50 transition-colors">{{ priceRoom1000 }} €</td>
              </tr>
              <tr class="hover:bg-gray-50 transition-colors group">
                <td class="py-6 px-8 font-bold text-gray-900 text-lg">1000 kg - 1400 kg</td>
                <td class="py-6 px-8 text-gray-400 font-medium line-through hidden md:table-cell">289,00 €</td>
                <td class="py-6 px-8 text-gray-500 font-medium line-through hidden sm:table-cell">259,00 €</td>
                <td class="py-6 px-8 text-3xl font-black text-gray-900 bg-yellow-50/50 group-hover:bg-yellow-100/50 transition-colors">{{ priceRoom1400 }} €</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="max-w-2xl mx-auto mb-20 text-center animate-fade-in" style="animation-delay: 0.3s;">
          <p class="text-sm text-gray-500 bg-gray-100 inline-block px-4 py-2 rounded-lg font-medium border border-gray-200">
            <strong class="text-gray-700">Napomena o PDV-u:</strong> Sukladno čl. 90. st. 2. Zakona o PDV-u, obrt nije u sustavu PDV-a. Iskazane cijene su konačne.
          </p>
        </div>

        <div class="max-w-4xl mx-auto mb-24 animate-fade-in" style="animation-delay: 0.4s;">
          <h2 class="text-3xl font-black text-gray-900 mb-8 text-center tracking-tight">Dodatne usluge</h2>

          <div class="bg-white rounded-3xl p-8 lg:p-10 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 max-w-2xl mx-auto">
            <div>
              <h4 class="text-xl font-bold text-gray-900 mb-3">Zbrinjavanje starog namještaja</h4>
              <p class="text-gray-600 font-medium leading-relaxed">
                Kada donosimo novo, staro odnosimo. Vršimo demontažu, iznošenje iz stana te ekološko zbrinjavanje starih kreveta, madraca ili ormara na reciklažno dvorište.
              </p>
            </div>
            <div class="shrink-0 text-center md:text-right md:border-l border-gray-100 md:pl-8">
              <span class="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Cijena usluge</span>
              <p class="text-3xl font-black text-gray-900">od {{ priceDisposal }} €</p>
              <span class="text-sm font-medium text-gray-500">po komadu</span>
            </div>
          </div>
        </div>

        <div class="max-w-3xl mx-auto text-center border-t border-gray-200 pt-16 animate-fade-in" style="animation-delay: 0.5s;">
          <h3 class="text-2xl font-black text-gray-900 mb-4">Informacije o naplati</h3>
          <p class="text-lg text-gray-600 font-medium mb-8">
            Obračun i naplata vrše se <strong class="text-gray-900">isključivo za uslugu prijevoza i unosa robe</strong>. Cijenu samog namještaja podmirujete direktno robnoj kući IKEA putem njihovog webshopa.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-4">
            <span class="bg-white px-6 py-3 rounded-xl border border-gray-200 shadow-sm font-bold text-gray-800">
              Gotovina pri preuzimanju
            </span>
            <span class="bg-white px-6 py-3 rounded-xl border border-gray-200 shadow-sm font-bold text-gray-800">
              Transakcijski račun (Virman)
            </span>
          </div>
        </div>

      </UContainer>
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
