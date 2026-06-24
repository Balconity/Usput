<script setup lang="ts">
import { ref, computed } from 'vue'

const colorMode = useColorMode()
colorMode.preference = 'light'

const appConfig = useAppConfig()
appConfig.ui.primary = 'yellow'
appConfig.ui.gray = 'neutral'

useHead({
  title: 'Usput | Povoljna IKEA dostava Varaždin',
  meta: [
    { name: 'description', content: 'Pametnija i do 20% povoljnija dostava IKEA paketa i namještaja iz Zagreba za Varaždin i okolicu. Provjerite cijenu, rezervirajte termin i prepustite preuzimanje nama.' },
    { name: 'keywords', content: 'IKEA dostava, dostava Zagreb Varaždin, preuzimanje paketomat, prijevoz namještaja, jeftina dostava, Usput dostava, dostava IKEA Varaždin' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://www.usput.hr/' },
    { property: 'og:title', content: 'Usput | Do 20% Povoljnija IKEA dostava Varaždin' },
    { property: 'og:description', content: 'Zalijepite svoju IKEA košaricu i odmah saznajte cijenu. Naše su cijene za namještaj do 20% niže od službene dostave. Preuzimamo pakete iz IKEA Paketomata i dostavljamo na Vaša vrata.' }
  ],
  link: [
    { rel: 'canonical', href: 'https://www.usput.hr/' }
  ]
})

// --- DINAMIČKO DOHVAĆANJE CIJENA (Novi, fiksni model) ---
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

// Izračun cijena za prikaz na karticama
const priceStandard = computed(() => Number(pricing.value.standard).toFixed(2).replace('.', ','))
const priceLarge = computed(() => Number(pricing.value.large).toFixed(2).replace('.', ','))
const priceDriveway = computed(() => Number(pricing.value.driveway100).toFixed(2).replace('.', ','))
const priceRoom = computed(() => Number(pricing.value.room400).toFixed(2).replace('.', ','))
</script>

<template>
  <div class="min-h-screen flex flex-col font-sans bg-gray-50 text-neutral-900 selection:bg-yellow-400 selection:text-black scroll-smooth">
    <AppHeader/>

    <main class="flex-grow">

      <section id="hero" class="relative pt-12 pb-24 lg:pt-24 lg:pb-32 bg-gradient-to-b from-gray-50 to-white overflow-hidden border-b border-gray-100">
        <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div class="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-yellow-400/20 rounded-full blur-3xl opacity-70 animate-pulse-slow"></div>
          <div class="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl opacity-70"></div>
        </div>

        <UContainer class="relative z-10">
          <div class="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center lg:items-start">

            <div class="lg:col-span-6 pt-4 lg:sticky lg:top-32 animate-fade-in-up">

              <div class="flex flex-wrap gap-3 mb-8">
                <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 font-bold text-xs border border-green-200/60 shadow-sm uppercase tracking-wider backdrop-blur-sm">
                  <UIcon name="i-lucide-trending-down" class="w-4 h-4" />
                  <span>Dostava namještaja 20% povoljnija od IKEA-e</span>
                </div>

                <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-50 text-yellow-800 font-bold text-xs border border-yellow-200/60 shadow-sm backdrop-blur-sm">
                  <UIcon name="i-lucide-map-pin" class="w-4 h-4" />
                  <span>Zagreb &rarr; Varaždin (i okolica)</span>
                </div>
              </div>

              <h1 class="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight text-gray-900 mb-6 drop-shadow-sm">
                Pametnija dostava.<br/>
                Ne isplati se ako nije <span class="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">usput.</span>
              </h1>

              <p class="text-lg text-gray-600 leading-relaxed max-w-lg mb-10 font-medium">
                Dostavljamo vaše <strong class="text-[#0057AD] font-bold">IKEA</strong> pakete iz Zagreba direktno na vaša vrata, brže i povoljnije od službene dostave namještaja.
                Zalijepite svoj popis za kupovinu i saznajte cijenu.
              </p>

              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 text-sm font-bold text-gray-500 bg-white/50 inline-flex p-4 rounded-2xl border border-gray-100 shadow-sm backdrop-blur-sm">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-check-circle-2" class="w-5 h-5 text-yellow-500" />
                  Trenutni izračun
                </div>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-check-circle-2" class="w-5 h-5 text-yellow-500" />
                  Preuzimanje iz Paketomata
                </div>
              </div>
            </div>

            <div class="lg:col-span-6 relative z-10 animate-fade-in-up" style="animation-delay: 0.1s;">
              <div class="relative">
                <div class="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-[2.5rem] blur-xl transform translate-y-4"></div>
                <VolumeCalculator class="relative" />
              </div>
            </div>

          </div>
        </UContainer>
      </section>

      <section id="how-it-works" class="py-24 bg-white relative z-20">
        <UContainer>
          <div class="text-center max-w-3xl mx-auto mb-20 animate-on-scroll">
            <h2 class="text-3xl lg:text-5xl font-black mb-6 text-gray-900 tracking-tight">Kako funkcionira?</h2>
            <p class="text-gray-500 text-lg font-medium">Cijeli proces je prilagođen vama, bez dugih čekanja i kompliciranih dogovora. Od kupnje do vaših vrata u 4 jednostavna koraka.</p>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            <div class="hidden lg:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-gray-100 via-yellow-400 to-gray-100 z-0"></div>

            <div class="relative z-10 flex flex-col items-center text-center group">
              <div class="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mb-8 group-hover:-translate-y-3 group-hover:shadow-[0_8px_30px_rgb(250,204,21,0.2)] group-hover:border-yellow-200 transition-all duration-300">
                <UIcon name="i-lucide-calculator" class="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <div class="w-8 h-8 rounded-full bg-gray-900 text-white font-bold flex items-center justify-center text-sm absolute top-20 -mr-24 border-4 border-white shadow-sm transition-transform group-hover:scale-110">1</div>
              <h3 class="text-xl font-black text-gray-900 mb-3">Provjerite cijenu</h3>
              <p class="text-sm text-gray-500 font-medium leading-relaxed px-4">Kopirajte link svog IKEA popisa u naš alat. Odmah ćete saznati cijenu i imamo li slobodan termin.</p>
            </div>

            <div class="relative z-10 flex flex-col items-center text-center group">
              <div class="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mb-8 group-hover:-translate-y-3 group-hover:shadow-[0_8px_30px_rgb(250,204,21,0.2)] group-hover:border-yellow-200 transition-all duration-300">
                <UIcon name="i-lucide-shopping-cart" class="w-10 h-10 text-gray-400 group-hover:text-yellow-500 transition-colors" />
              </div>
              <div class="w-8 h-8 rounded-full bg-gray-900 text-white font-bold flex items-center justify-center text-sm absolute top-20 -mr-24 border-4 border-white shadow-sm transition-transform group-hover:scale-110">2</div>
              <h3 class="text-xl font-black text-gray-900 mb-3">Naručite u IKEA-i</h3>
              <p class="text-sm text-gray-500 font-medium leading-relaxed px-4">Obavite kupnju na IKEA webshopu i pod način preuzimanja obavezno odaberite <strong>IKEA Paketomat</strong>.</p>
            </div>

            <div class="relative z-10 flex flex-col items-center text-center group">
              <div class="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mb-8 group-hover:-translate-y-3 group-hover:shadow-[0_8px_30px_rgb(250,204,21,0.2)] group-hover:border-yellow-200 transition-all duration-300">
                <UIcon name="i-lucide-clipboard-check" class="w-10 h-10 text-gray-400 group-hover:text-green-500 transition-colors" />
              </div>
              <div class="w-8 h-8 rounded-full bg-gray-900 text-white font-bold flex items-center justify-center text-sm absolute top-20 -mr-24 border-4 border-white shadow-sm transition-transform group-hover:scale-110">3</div>
              <h3 class="text-xl font-black text-gray-900 mb-3">Rezervirajte dostavu</h3>
              <p class="text-sm text-gray-500 font-medium leading-relaxed px-4">Vratite se ovdje, upišite svoj broj narudžbe iz IKEA-e i adresu na koju vozimo vaše pakete.</p>
            </div>

            <div class="relative z-10 flex flex-col items-center text-center group">
              <div class="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-3xl flex items-center justify-center shadow-lg shadow-yellow-500/20 border border-yellow-400 mb-8 group-hover:-translate-y-3 transition-all duration-300">
                <UIcon name="i-lucide-smartphone" class="w-10 h-10 text-gray-900" />
              </div>
              <div class="w-8 h-8 rounded-full bg-gray-900 text-white font-bold flex items-center justify-center text-sm absolute top-20 -mr-24 border-4 border-white shadow-sm transition-transform group-hover:scale-110">4</div>
              <h3 class="text-xl font-black text-gray-900 mb-3">Pošaljite nam PIN</h3>
              <p class="text-sm text-gray-500 font-medium leading-relaxed px-4">Kada vam IKEA pošalje SMS s PIN kodom, proslijedite nam ga. Mi preuzimamo robu i dolazimo k vama!</p>
            </div>
          </div>
        </UContainer>
      </section>

      <section id="pricing" class="py-24 bg-gray-50 relative z-20 border-y border-gray-200 overflow-hidden">
        <UContainer class="relative z-10">
          <div class="text-center max-w-3xl mx-auto mb-16">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-200 text-gray-800 font-bold text-xs mb-6 uppercase tracking-wider">
              <UIcon name="i-lucide-receipt" class="w-4 h-4" />
              <span>Službeni cjenik usluga</span>
            </div>
            <h2 class="text-3xl lg:text-5xl font-black mb-6 text-gray-900 tracking-tight">Transparentan cjenik</h2>
            <p class="text-gray-500 text-lg font-medium">Zadržavamo iste cijene kao IKEA za male pakete uz bržu uslugu, dok na dostavu namještaja nudimo <strong>20% popusta</strong> u odnosu na službene cijene.</p>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

            <div class="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div class="mb-6 bg-gray-50 w-14 h-14 rounded-xl flex items-center justify-center border border-gray-100"><UIcon name="i-lucide-package" class="w-7 h-7 text-gray-700" /></div>
              <h3 class="text-xl font-bold mb-2 text-gray-900">Standardni paket</h3>
              <p class="text-sm text-gray-500 mb-6 flex-grow border-b border-gray-100 pb-6">
                Sitnice, dekoracije, posuđe i tekstil.<br><br>
                <strong>Do 14,99 kg</strong><br>Maks. dim: 58x38x30 cm
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
                <strong>Do 29,99 kg</strong><br>Maks. dim: 80x60x50 cm
              </p>
              <div class="flex flex-col">
                <span class="text-xs text-gray-400 font-bold uppercase mb-1">Cijena kao u IKEA-i:</span>
                <p class="text-4xl font-black text-gray-900">{{ priceLarge }} €</p>
              </div>
            </div>

            <div class="bg-gray-900 rounded-3xl p-8 border border-gray-800 shadow-xl flex flex-col text-white transform md:-translate-y-2 relative overflow-hidden group">
              <div class="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div class="absolute top-0 right-0 bg-yellow-400 text-gray-900 text-[10px] font-black uppercase tracking-widest py-1.5 px-4 rounded-bl-xl z-10">
                20% Popusta
              </div>
              <div class="mb-6 bg-gray-800 w-14 h-14 rounded-xl flex items-center justify-center border border-gray-700 relative z-10"><UIcon name="i-lucide-truck" class="w-7 h-7 text-yellow-400" /></div>
              <h3 class="text-xl font-bold mb-2 text-white relative z-10">Do kolnog prilaza</h3>
              <p class="text-sm text-gray-400 mb-6 flex-grow border-b border-gray-700 pb-6 relative z-10">
                Srednji namještaj. Dostava ispred kuće ili najbližeg ulaza u zgradu.<br><br>
                <strong>Težina do 100 kg</strong>
              </p>
              <div class="flex flex-col relative z-10">
                <em class="text-gray-500 text-sm mb-1 font-medium">IKEA Zona 2: <span class="line-through">54,99 €</span></em>
                <p class="text-4xl font-black text-yellow-400">{{ priceDriveway }} €</p>
              </div>
            </div>

            <div class="bg-gradient-to-b from-yellow-300 to-yellow-400 rounded-3xl p-8 border border-yellow-400 shadow-md flex flex-col relative overflow-hidden">
              <div class="absolute -right-6 -bottom-6 opacity-10 pointer-events-none transition-transform duration-500 hover:scale-110"><UIcon name="i-lucide-home" class="w-48 h-48" /></div>
              <div class="mb-6 bg-yellow-50/50 w-14 h-14 rounded-xl flex items-center justify-center border border-yellow-200 backdrop-blur-sm relative z-10"><UIcon name="i-lucide-arrow-up-circle" class="w-7 h-7 text-yellow-700" /></div>
              <h3 class="text-xl font-bold mb-2 text-gray-900 relative z-10">Dostava u prostoriju</h3>
              <p class="text-sm text-gray-800 mb-6 flex-grow border-b border-yellow-500/30 pb-6 font-medium relative z-10">
                Teški namještaj i kuhinje. Fizički unos na kat ili u kuću po izboru kupca.<br><br>
                <strong>Od 0 do 400 kg</strong>
              </p>
              <div class="flex flex-col relative z-10">
                <em class="text-yellow-800 text-sm mb-1 font-medium">IKEA Family: <span class="line-through">119,00 €</span></em>
                <div class="flex items-baseline gap-1">
                  <span class="text-lg font-bold text-gray-700">od</span>
                  <p class="text-4xl font-black text-gray-900">{{ priceRoom }} €</p>
                </div>
              </div>
            </div>

          </div>

          <div class="text-center mt-12">
            <NuxtLink to="/pricelist" class="inline-flex items-center gap-2 text-sm font-black text-gray-900 bg-white border border-gray-200 px-6 py-3 rounded-xl shadow-sm hover:border-yellow-400 hover:bg-yellow-50 transition-all">
              Pogledajte sve kategorije težine i dodatne usluge <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
            </NuxtLink>
          </div>
        </UContainer>
      </section>

      <section id="services" class="py-24 bg-white">
        <UContainer>
          <div class="text-center max-w-2xl mx-auto mb-16">
            <h2 class="text-3xl lg:text-5xl font-black mb-6 text-gray-900 tracking-tight">Mala logistika, velika prednost</h2>
            <p class="text-gray-500 text-lg font-medium">Fokusirani smo isključivo na vaš paket, bez usputnih stanica po cijeloj Hrvatskoj.</p>
          </div>

          <div class="grid md:grid-cols-3 gap-8">
            <div class="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:border-yellow-400 transition-colors group">
              <div class="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <UIcon name="i-lucide-shield-check" class="w-6 h-6 text-gray-700" />
              </div>
              <h3 class="text-xl font-bold mb-3 text-gray-900">Treća strana pri preuzimanju</h3>
              <p class="text-gray-500 font-medium leading-relaxed">Prilikom kupnje na webshopu navedite ime našeg dostavljača koji će u vaše ime preuzeti robu, kako biste bili bezbrižni i zakonski pokriveni.</p>
            </div>

            <div class="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:border-yellow-400 transition-colors group">
              <div class="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <UIcon name="i-lucide-box" class="w-6 h-6 text-gray-700" />
              </div>
              <h3 class="text-xl font-bold mb-3 text-gray-900">Preuzimanje iz Paketomata</h3>
              <p class="text-gray-500 font-medium leading-relaxed">Izbjegnite gužve. Usmjerite narudžbe u IKEA paketomat, proslijedite nam PIN kod čim ga dobijete i mi robu preuzimamo za vas.</p>
            </div>

            <div class="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:border-yellow-400 transition-colors group">
              <div class="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <UIcon name="i-lucide-route" class="w-6 h-6 text-gray-700" />
              </div>
              <h3 class="text-xl font-bold mb-3 text-gray-900">Direktno bez prekrcavanja</h3>
              <p class="text-gray-500 font-medium leading-relaxed">Vaša roba ide iz robne kuće direktno u naše vozilo i na vašu adresu, bez stajanja, gubitka ili pretumbavanja u sortirnim centrima.</p>
            </div>
          </div>
        </UContainer>
      </section>
    </main>

    <AppFooter/>
  </div>
</template>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-pulse-slow {
  animation: pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
