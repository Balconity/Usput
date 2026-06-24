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
  roomOver1400: 250.00
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
    roomOver1400: pd.roomOver1400 ?? 250.00
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

</script>

<template>
  <div class="min-h-screen flex flex-col font-sans bg-gray-50 text-neutral-900 selection:bg-yellow-400 selection:text-black scroll-smooth">
    <AppHeader />

    <main class="flex-grow pt-12 pb-20 lg:pt-20 lg:pb-32 relative overflow-hidden">

      <div class="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-yellow-400/10 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div class="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-blue-400/5 rounded-full blur-3xl pointer-events-none z-0"></div>

      <UContainer class="relative z-10">

        <div class="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 font-bold text-xs mb-6 border border-gray-200 uppercase tracking-wider">
            <UIcon name="i-lucide-receipt" class="w-4 h-4" />
            <span>Službeni cjenik usluga</span>
          </div>
          <h1 class="text-4xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
            Transparentno i <span class="text-yellow-500">bez skrivenih troškova.</span>
          </h1>
          <p class="text-lg text-gray-600 leading-relaxed">
            Naše cijene su jasne i poštene. Zadržavamo iste cijene kao IKEA za male pakete uz bržu uslugu, dok na dostavu namještaja nudimo <strong>20% popusta</strong> u odnosu na službene cijene.
          </p>
        </div>

        <div class="max-w-4xl mx-auto mb-12 bg-white border border-yellow-200 shadow-sm rounded-2xl p-5 flex items-start gap-4 animate-fade-in" style="animation-delay: 0.1s;">
          <UIcon name="i-lucide-info" class="w-6 h-6 text-yellow-500 shrink-0 mt-0.5" />
          <div class="text-sm text-gray-600">
            <strong class="text-gray-900 block mb-1">Napomena o PDV-u:</strong>
            Sukladno članku 90. stavku 2. Zakona o porezu na dodanu vrijednost (PDV), obrt nije u sustavu PDV-a te <strong>PDV nije obračunat na iskazane cijene</strong>. Iskazane cijene su konačne za kupca.
          </div>
        </div>

        <div class="grid md:grid-cols-3 gap-6 mb-8 animate-fade-in" style="animation-delay: 0.2s;">

          <div class="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div class="mb-6 bg-gray-50 w-14 h-14 rounded-xl flex items-center justify-center border border-gray-100"><UIcon name="i-lucide-package" class="w-7 h-7 text-gray-700" /></div>
            <h3 class="text-xl font-bold mb-2 text-gray-900">Standardni paket</h3>
            <p class="text-sm text-gray-500 mb-6 flex-grow border-b border-gray-100 pb-6">
              Sitnice, dekoracije, posuđe i tekstil.<br><br>
              <strong>Do 14,99 kg</strong><br>Maks. dimenzije: 58x38x30 cm
            </p>
            <div class="flex flex-col">
              <span class="text-xs text-gray-400 font-bold uppercase mb-1">Cijena kao u IKEA-i:</span>
              <p class="text-4xl font-black text-gray-900">{{ priceStandard }} €</p>
            </div>
          </div>

          <div class="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div class="mb-6 bg-gray-50 w-14 h-14 rounded-xl flex items-center justify-center border border-gray-100"><UIcon name="i-lucide-boxes" class="w-7 h-7 text-gray-700" /></div>
            <h3 class="text-xl font-bold mb-2 text-gray-900">Veliki paket</h3>
            <p class="text-sm text-gray-500 mb-6 flex-grow border-b border-gray-100 pb-6">
              Manje police, stolice, tepisi i rasvjeta.<br><br>
              <strong>Do 29,99 kg</strong><br>Maks. dimenzije: 80x60x50 cm
            </p>
            <div class="flex flex-col">
              <span class="text-xs text-gray-400 font-bold uppercase mb-1">Cijena kao u IKEA-i:</span>
              <p class="text-4xl font-black text-gray-900">{{ priceLarge }} €</p>
            </div>
          </div>

          <div class="bg-gray-900 rounded-3xl p-8 border border-gray-800 shadow-xl flex flex-col text-white transform md:-translate-y-2 relative overflow-hidden">
            <div class="absolute top-0 right-0 bg-yellow-400 text-gray-900 text-[10px] font-black uppercase tracking-widest py-1.5 px-4 rounded-bl-xl">
              20% Popusta
            </div>
            <div class="mb-6 bg-gray-800 w-14 h-14 rounded-xl flex items-center justify-center border border-gray-700"><UIcon name="i-lucide-truck" class="w-7 h-7 text-yellow-400" /></div>
            <h3 class="text-xl font-bold mb-2 text-white">Do kolnog prilaza</h3>
            <p class="text-sm text-gray-400 mb-6 flex-grow border-b border-gray-700 pb-6">
              Srednji namještaj. Dostava ispred kuće ili najbližeg ulaza u zgradu.<br><br>
              <strong>Težina do 100 kg</strong><br>
            </p>
            <div class="flex flex-col">
              <em class="text-gray-500 text-sm mb-1">IKEA Zona 2: <span class="line-through">54,99 €</span></em>
              <p class="text-4xl font-black text-yellow-400">{{ priceDriveway }} €</p>
            </div>
          </div>

        </div>

        <div class="bg-white rounded-3xl shadow-md border border-yellow-400 overflow-hidden mb-20 animate-fade-in" style="animation-delay: 0.3s;">
          <div class="bg-yellow-50 px-6 sm:px-10 py-8 border-b border-yellow-200 flex flex-col sm:flex-row items-center gap-6">
            <div class="w-16 h-16 rounded-2xl bg-yellow-400 flex items-center justify-center shadow-sm shrink-0">
              <UIcon name="i-lucide-home" class="w-8 h-8 text-gray-900" />
            </div>
            <div class="text-center sm:text-left">
              <h2 class="text-2xl font-black text-gray-900 mb-2">Dostava u prostoriju (Unos u objekt)</h2>
              <p class="text-gray-600">Usluga unosa teškog namještaja direktno u Vaš dom. Cijene su <strong>20% niže od službenih IKEA Family cijena</strong>.</p>
            </div>
          </div>

          <div class="p-0 sm:p-4">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                <tr class="bg-white border-b border-gray-100">
                  <th class="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Kategorija težine</th>
                  <th class="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:table-cell">Redovna IKEA cijena</th>
                  <th class="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:table-cell">IKEA Family cijena</th>
                  <th class="py-4 px-6 text-xs font-black text-yellow-600 uppercase tracking-widest bg-yellow-50/50">Naša cijena (USPUT)</th>
                </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="py-5 px-6 font-bold text-gray-900">Do 400 kg</td>
                  <td class="py-5 px-6 text-gray-500 line-through hidden sm:table-cell">149,00 €</td>
                  <td class="py-5 px-6 text-gray-500 line-through hidden sm:table-cell">119,00 €</td>
                  <td class="py-5 px-6 text-2xl font-black text-gray-900 bg-yellow-50/50">{{ priceRoom400 }} €</td>
                </tr>
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="py-5 px-6 font-bold text-gray-900">400 kg - 600 kg</td>
                  <td class="py-5 px-6 text-gray-500 line-through hidden sm:table-cell">159,00 €</td>
                  <td class="py-5 px-6 text-gray-500 line-through hidden sm:table-cell">129,00 €</td>
                  <td class="py-5 px-6 text-2xl font-black text-gray-900 bg-yellow-50/50">{{ priceRoom600 }} €</td>
                </tr>
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="py-5 px-6 font-bold text-gray-900">600 kg - 1000 kg</td>
                  <td class="py-5 px-6 text-gray-500 line-through hidden sm:table-cell">169,00 €</td>
                  <td class="py-5 px-6 text-gray-500 line-through hidden sm:table-cell">139,00 €</td>
                  <td class="py-5 px-6 text-2xl font-black text-gray-900 bg-yellow-50/50">{{ priceRoom1000 }} €</td>
                </tr>
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="py-5 px-6 font-bold text-gray-900">1000 kg - 1400 kg</td>
                  <td class="py-5 px-6 text-gray-500 line-through hidden sm:table-cell">289,00 €</td>
                  <td class="py-5 px-6 text-gray-500 line-through hidden sm:table-cell">259,00 €</td>
                  <td class="py-5 px-6 text-2xl font-black text-gray-900 bg-yellow-50/50">{{ priceRoom1400 }} €</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="max-w-4xl mx-auto mb-20 animate-fade-in" style="animation-delay: 0.4s;">
          <h2 class="text-2xl font-black text-gray-900 mb-8 text-center">Dodatne usluge</h2>

          <div class="grid md:grid-cols-2 gap-6">
            <div class="bg-gray-50 rounded-2xl p-6 border border-gray-200 flex flex-col justify-between">
              <div>
                <div class="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center mb-4">
                  <UIcon name="i-lucide-wrench" class="w-5 h-5 text-gray-600" />
                </div>
                <h4 class="font-bold text-gray-900 mb-2">Stručna montaža namještaja</h4>
                <p class="text-sm text-gray-600 mb-4">Nemate vremena, strpljenja ili alata? Naš tim će sastaviti Vaš novi namještaj odmah nakon isporuke. Brzo, čisto i bez stresa.</p>
              </div>
              <div class="pt-4 border-t border-gray-200/60">
                <span class="text-xs font-bold text-gray-400 uppercase block mb-0.5">Cijena usluge:</span>
                <p class="text-xl font-black text-gray-900">25,00 € / sat <span class="text-xs font-normal text-gray-500">(min. 1 sat)</span></p>
              </div>
            </div>

            <div class="bg-gray-50 rounded-2xl p-6 border border-gray-200 flex flex-col justify-between">
              <div>
                <div class="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center mb-4">
                  <UIcon name="i-lucide-trash-2" class="w-5 h-5 text-gray-600" />
                </div>
                <h4 class="font-bold text-gray-900 mb-2">Zbrinjavanje starog namještaja</h4>
                <p class="text-sm text-gray-600 mb-4">Kada donosimo novo, staro odnosimo. Vršimo demontažu, iznošenje iz stana te ekološko zbrinjavanje starih kreveta, madraca ili ormara na reciklažno dvorište.</p>
              </div>
              <div class="pt-4 border-t border-gray-200/60">
                <span class="text-xs font-bold text-gray-400 uppercase block mb-0.5">Cijena usluge:</span>
                <p class="text-xl font-black text-gray-900">od 30,00 € / <span class="text-sm font-normal text-gray-500">komad</span></p>
              </div>
            </div>
          </div>
        </div>

        <div class="max-w-3xl mx-auto text-center border-t border-gray-200 pt-12 animate-fade-in" style="animation-delay: 0.5s;">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Informacije o naplati</h3>
          <p class="text-sm text-gray-600 mb-6">
            Obračun i naplata vrše se isključivo za uslugu <strong>prijevoza, montaže i manipulacije robom</strong>.
            Cijenu samog namještaja i artikala podmirujete direktno robnoj kući (IKEA) putem njihovog webshopa.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-4">
            <span class="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-bold text-gray-700">
              <UIcon name="i-lucide-banknote" class="w-5 h-5 text-green-600" /> Gotovina pri preuzimanju
            </span>
            <span class="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-bold text-gray-700">
              <UIcon name="i-lucide-landmark" class="w-5 h-5 text-blue-600" /> Transakcijski račun (Virman)
            </span>
          </div>
        </div>

      </UContainer>
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.5s ease-out forwards; opacity: 0; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
