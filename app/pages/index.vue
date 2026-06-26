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

// --- OBAVIJEST O TESTIRANJU (BETA STATUS) ---
const showBetaBanner = ref(true)

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

    <div v-if="showBetaBanner" class="bg-gray-900 text-white relative z-50 overflow-hidden shadow-md">
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-30"></div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 relative flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="bg-yellow-400 text-gray-900 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 animate-pulse">
            BETA TEST
          </div>
          <p class="text-xs sm:text-sm font-medium leading-tight">
            <span class="font-bold text-yellow-400">Aplikacija je u fazi testiranja!</span> Sustav je trenutno u probnom radu. Ako uočite grešku ili imate pitanje, slobodno nam javite.
          </p>
        </div>
        <button @click="showBetaBanner = false" class="text-gray-400 hover:text-white p-1 rounded-md transition-colors focus:outline-none shrink-0" aria-label="Zatvori obavijest">
          <UIcon name="i-lucide-x" class="w-4 h-4 block" />
        </button>
      </div>
    </div>

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
              <h1 class="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight text-gray-900 mb-6 drop-shadow-sm">
                Pametnija dostava.<br/>
                Ne isplati se ako nije <span class="text-warning">usput</span>.
              </h1>
              <p class="text-lg text-gray-600 leading-relaxed max-w-lg mb-10 font-medium">
                Dostavljamo <strong class="text-[#0057AD] font-bold">IKEA</strong> pakete direktno na vaša vrata, brže i povoljnije od službene dostave namještaja.
                Zalijepite link svoje IKEA košarice u formu i saznajte detalje dostave.
              </p>
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

      <section id="how-it-works" class="py-24 lg:py-32 bg-white relative z-20 overflow-hidden">
        <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjZTU1MjU3NyIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PHBhdGggZD0iTTM2IDM0djI2SDM0VjM0aC0ydjI2SDMwVjM0aC0ydjI2SDI2VjM0aC0ydjI2SDIyVjM0aC0ydjI2SDE4VjM0aC0ydjI2SDE0VjM0aC0ydjI2SDEwVjM0SDh2MjZINlYzNEg0djI2SDJWMzRIMHYtMmg2MFYzMnoiLz48pGF0aCBkPSJNMzYgMjhWMGgydjI4aDJWMGgydjI4aDJWMGgydjI4aDJWMGgydjI4aDJWMGgydjI4aDJWMGgydjI4SDI4em0yIDB2MjhoLTJWMjhoMnpNOCAyOHYtMmgyOHYyaC0yeiIvPjwvZz48L3N2Zz4=')] opacity-50 z-0"></div>

        <UContainer class="relative z-10">
          <div class="text-center max-w-3xl mx-auto mb-20 lg:mb-28 animate-fade-in-up">
            <span class="inline-block py-1.5 px-3 rounded-full bg-yellow-100 text-yellow-800 font-bold text-xs uppercase tracking-widest mb-4">Proces dostave</span>
            <h2 class="text-3xl lg:text-5xl font-black mb-6 text-gray-900 tracking-tight">Pametniji put do namještaja</h2>
            <p class="text-gray-500 text-lg lg:text-xl font-medium">Nema kompliciranih popisa ni ručnog prepisivanja artikala. Naš sustav se direktno spaja na vašu IKEA košaricu u 3 jednostavna koraka.</p>
          </div>

          <div class="space-y-24 lg:space-y-32">

            <div class="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              <div class="lg:w-1/2 order-2 lg:order-1 relative group perspective">
                <div class="absolute inset-0 bg-gradient-to-br from-blue-100 to-transparent rounded-3xl transform -rotate-3 scale-105 transition-transform group-hover:rotate-0 duration-500"></div>
                <div class="relative bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                  <div class="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                    <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white"><UIcon name="i-lucide-shopping-bag" class="w-4 h-4"/></div>
                    <span class="font-bold text-gray-900">IKEA Webshop</span>
                  </div>
                  <div class="space-y-3 mb-6">
                    <div class="h-16 bg-gray-50 rounded-xl border border-gray-100 flex items-center px-4 gap-4">
                      <div class="w-10 h-10 bg-gray-200 rounded-lg"></div>
                      <div class="space-y-2 flex-1"><div class="h-2 w-1/3 bg-gray-300 rounded"></div><div class="h-2 w-1/4 bg-gray-200 rounded"></div></div>
                    </div>
                    <div class="h-16 bg-gray-50 rounded-xl border border-gray-100 flex items-center px-4 gap-4">
                      <div class="w-10 h-10 bg-gray-200 rounded-lg"></div>
                      <div class="space-y-2 flex-1"><div class="h-2 w-1/2 bg-gray-300 rounded"></div><div class="h-2 w-1/5 bg-gray-200 rounded"></div></div>
                    </div>
                  </div>
                  <div class="flex justify-between items-center bg-blue-50 text-blue-800 p-3 rounded-xl border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors">
                    <span class="text-sm font-bold">Završi i podijeli košaricu</span>
                    <UIcon name="i-lucide-share" class="w-5 h-5"/>
                  </div>
                </div>
              </div>
              <div class="lg:w-1/2 order-1 lg:order-2 space-y-6">
                <div class="w-16 h-16 bg-gray-900 text-yellow-400 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg transform -rotate-6">1</div>
                <h3 class="text-3xl font-black text-gray-900">Složite svoju košaricu</h3>
                <p class="text-lg text-gray-600 font-medium leading-relaxed">
                  Otvorite službenu IKEA aplikaciju ili web stranicu i dodajte sve željene proizvode u košaricu. Kada ste gotovi, nemojte ići na plaćanje! Samo kliknite na ikonu za <strong class="text-blue-600">dijeljenje košarice</strong> i kopirajte generirani link.
                </p>
              </div>
            </div>

            <div class="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              <div class="lg:w-1/2 space-y-6">
                <div class="w-16 h-16 bg-yellow-400 text-gray-900 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg transform rotate-6">2</div>
                <h3 class="text-3xl font-black text-gray-900">Izračun i narudžba</h3>
                <p class="text-lg text-gray-600 font-medium leading-relaxed">
                  Zalijepite kopirani link u formu na vrhu naše stranice. Sustav odmah računa točan volumen i provjerava dostupnost vozila. Od tog trenutka <strong class="text-gray-900">imate rezerviran termin od 30 minuta</strong>. U tom vremenu završite plaćanje u IKEA-i, vratite se k nama s brojem narudžbe i potvrdite dostavu.
                </p>
                <div class="inline-flex items-center gap-2 text-sm font-bold text-yellow-700 bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200">
                  <UIcon name="i-lucide-timer" class="w-5 h-5" /> 30 minuta osiguran prostor u kombiju
                </div>
              </div>
              <div class="lg:w-1/2 relative group perspective">
                <div class="absolute inset-0 bg-gradient-to-bl from-yellow-100 to-transparent rounded-3xl transform rotate-3 scale-105 transition-transform group-hover:rotate-0 duration-500"></div>
                <div class="relative bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                  <div class="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                    <div class="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-gray-900"><UIcon name="i-lucide-link" class="w-4 h-4"/></div>
                    <span class="font-bold text-gray-900">Usput Dostava</span>
                  </div>
                  <div class="mb-4">
                    <label class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Link vaše IKEA košarice</label>
                    <div class="bg-white border-2 border-yellow-400 rounded-xl p-3 flex items-center justify-between shadow-sm">
                      <span class="text-sm text-gray-400 truncate w-3/4">https://www.ikea.com/hr/hr/favorites...</span>
                      <div class="bg-gray-100 p-1.5 rounded-lg"><UIcon name="i-lucide-clipboard-paste" class="w-4 h-4 text-gray-500"/></div>
                    </div>
                  </div>
                  <div class="bg-gray-900 text-white rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div class="text-xs text-gray-400 font-medium mb-0.5">Izračunata cijena isporuke</div>
                      <div class="text-xl font-black text-yellow-400">43,99 €</div>
                    </div>
                    <UButton color="yellow" variant="solid" size="sm" class="text-black font-bold">Rezerviraj termin</UButton>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              <div class="lg:w-1/2 order-2 lg:order-1 relative group perspective">
                <div class="absolute inset-0 bg-gradient-to-br from-green-100 to-transparent rounded-3xl transform -rotate-2 scale-105 transition-transform group-hover:rotate-0 duration-500"></div>
                <div class="relative bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] text-center">
                  <div class="w-20 h-20 bg-green-50 rounded-full mx-auto flex items-center justify-center mb-6 border-4 border-white shadow-md">
                    <UIcon name="i-lucide-mail-check" class="w-10 h-10 text-green-500"/>
                  </div>
                  <h4 class="text-xl font-black text-gray-900 mb-2">Sve stiže na mail</h4>
                  <p class="text-sm text-gray-500 font-medium mb-6 px-4">Potvrda narudžbe i račun stižu u vaš inbox. Kada IKEA pripremi robu, očekujemo vaš SMS.</p>

                  <div class="flex flex-col gap-2 mt-2">
                    <div class="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-600 font-bold text-xs px-3 py-2 rounded-lg justify-center">
                      <UIcon name="i-lucide-message-square" class="w-4 h-4"/> 1. IKEA vam šalje SMS s PIN-om
                    </div>
                    <div class="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 font-bold text-xs px-3 py-2 rounded-lg justify-center shadow-sm">
                      <UIcon name="i-lucide-forward" class="w-4 h-4"/> 2. Proslijedite PIN i oznaku nama
                    </div>
                  </div>
                </div>
              </div>
              <div class="lg:w-1/2 order-1 lg:order-2 space-y-6">
                <div class="w-16 h-16 bg-gray-900 text-green-400 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg transform -rotate-3">3</div>
                <h3 class="text-3xl font-black text-gray-900">Potvrda i preuzimanje</h3>
                <p class="text-lg text-gray-600 font-medium leading-relaxed">
                  Odmah nakon narudžbe, na e-mail dobivate službenu potvrdu. Kada vaši proizvodi budu spremni za prikup, IKEA će vam poslati SMS. Tada nam samo trebate <strong class="text-gray-900">proslijediti PIN i oznaku paketomata</strong>, a mi odlazimo po vaše pakete i dovozimo ih na vaša vrata!
                </p>
              </div>
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
          <div class="text-center max-w-2xl mx-auto mb-16 animate-fade-in-up">
            <span class="inline-block py-1.5 px-3 rounded-full bg-blue-100 text-blue-800 font-bold text-xs uppercase tracking-widest mb-4">Zašto odabrati nas?</span>
            <h2 class="text-3xl lg:text-5xl font-black mb-6 text-gray-900 tracking-tight">Lokalni pristup, velika prednost</h2>
            <p class="text-gray-500 text-lg font-medium">Usluga krojena isključivo za Varaždin i okolicu. Vaš namještaj ne putuje danima po sortirnim centrima – vozimo direktno iz robne kuće do Vaših vrata.</p>
          </div>

          <div class="grid md:grid-cols-3 gap-8">

            <div class="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:border-yellow-400 hover:shadow-lg transition-all duration-300 group">
              <div class="w-14 h-14 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <UIcon name="i-lucide-route" class="w-7 h-7 text-gray-800" />
              </div>
              <h3 class="text-xl font-bold mb-3 text-gray-900">Direktna ruta Zagreb – Varaždin</h3>
              <p class="text-gray-500 font-medium leading-relaxed">
                Zaboravite na velike kurirske službe kod kojih se Vaš namještaj vozi cijelim sjeverom Hrvatske prije isporuke. Naša ruta je fiksna, a isporuka brza, predvidljiva i točna.
              </p>
            </div>

            <div class="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:border-yellow-400 hover:shadow-lg transition-all duration-300 group">
              <div class="w-14 h-14 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-yellow-400 transition-transform">
                <UIcon name="i-lucide-box" class="w-7 h-7 text-gray-700" />
              </div>
              <h3 class="text-xl font-bold mb-3 text-gray-900">Preuzimanje iz Paketomata</h3>
              <p class="text-gray-500 font-medium leading-relaxed">
                Izbjegnite čekanje u redovima i gužve na šalterima. Usmjerite svoju narudžbu u vanjski IKEA Paketomat, proslijedite nam PIN, a mi ćemo beskontaktno preuzeti Vašu robu.
              </p>
            </div>

            <div class="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:border-yellow-400 hover:shadow-lg transition-all duration-300 group">
              <div class="w-14 h-14 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-yellow-400 transition-transform">
                <UIcon name="i-lucide-shield-check" class="w-7 h-7 text-gray-700" />
              </div>
              <h3 class="text-xl font-bold mb-3 text-gray-900">Bez prekrcavanja i oštećenja</h3>
              <p class="text-gray-500 font-medium leading-relaxed">
                Vaši paketi izlaze iz IKEA-e, pažljivo se slažu u naše vozilo i vade tek pred Vašom kućom. Nema tjednog skladištenja i pretumbavanja, čime drastično smanjujemo rizik od oštećenja.
              </p>
            </div>

          </div>
        </UContainer>
      </section>

      <section id="about-us" class="py-24 bg-gray-50 border-t border-gray-100 relative overflow-hidden">
        <div class="absolute -right-64 -top-64 w-[500px] h-[500px] bg-yellow-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <UContainer class="relative z-10">
          <div class="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            <div class="order-2 lg:order-1 space-y-6 animate-fade-in-up">
              <h2 class="text-3xl lg:text-5xl font-black text-gray-900 tracking-tight">Tko stoji iza Usput dostave?</h2>

              <div class="space-y-4 text-lg text-gray-600 font-medium leading-relaxed">
                <p>
                  Ideja za "Usput" nastala je iz želje da našim sugrađanima riješimo konkretan problem. Svjedočili smo kako ljudi gube dragocjeno vrijeme i živce na organizaciju prijevoza iz Zagreba, posuđivanje kombija, nošenje teških kutija i čekanje logističkih službi koje su često bile preskupe i spore.
                </p>
                <p>
                  Zato smo odlučili zasukati rukave i ponuditi bolju alternativu. Naš je cilj unaprijediti standard dostave u našem kraju i ljudima maksimalno olakšati opremanje doma. Kod nas nema call centara i prebacivanja paketa po skladištima – kada rezervirate termin, znate da posao odrađujemo mi osobno, odgovorno i s puno pažnje prema vašim stvarima. Vaše je samo da odaberete, a mi preuzimamo sav teški posao.
                </p>
              </div>

              <div class="pt-8 border-t border-gray-200/60 flex flex-col sm:flex-row gap-6">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center border border-gray-200">
                    <UIcon name="i-lucide-map-pin" class="w-5 h-5 text-yellow-500"/>
                  </div>
                  <div class="text-sm">
                    <p class="font-bold text-gray-900">100% Lokalno</p>
                    <p class="text-gray-500">Iz Varaždina za Varaždin i okolicu</p>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center border border-gray-200">
                    <UIcon name="i-lucide-users" class="w-5 h-5 text-blue-500"/>
                  </div>
                  <div class="text-sm">
                    <p class="font-bold text-gray-900">Osobni pristup</p>
                    <p class="text-gray-500">Odgovaramo za svaki paket</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="order-1 lg:order-2 relative group perspective">
              <div class="absolute inset-0 bg-gradient-to-tr from-yellow-300 to-yellow-100 rounded-3xl transform rotate-3 scale-105 transition-transform duration-500 group-hover:rotate-1 group-hover:scale-100"></div>

              <div class="relative bg-white p-2 rounded-3xl shadow-xl">

                <div class="aspect-[4/3] bg-gray-900 rounded-2xl overflow-hidden relative flex flex-col items-center justify-center p-8 text-center border border-gray-800">
                  <div class="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none"></div>
                  <div class="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

                  <div class="relative z-10 mb-6 transition-transform duration-500 group-hover:-translate-y-2">
                    <div class="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700 shadow-lg">
                      <UIcon name="i-lucide-truck" class="w-10 h-10 text-yellow-400" />
                    </div>
                    <div class="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-2 border-gray-900 shadow-sm">
                      <UIcon name="i-lucide-map-pin" class="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <h3 class="relative z-10 text-2xl font-black text-white mb-2 tracking-tight">Usput Dostava</h3>
                  <p class="relative z-10 text-gray-400 font-medium text-sm leading-relaxed max-w-xs mx-auto">
                    Vaš namještaj je u sigurnim rukama.<br/>
                    Od preuzimanja u Zagrebu do Vašeg dnevnog boravka u Varaždinu.
                  </p>

                  <div class="relative z-10 mt-8 pt-6 border-t border-gray-800 w-full flex justify-center items-center gap-2">
                    <span class="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Osnivači:</span>
                    <span class="text-xs text-yellow-400 font-black uppercase tracking-wider">Kruno & Tomi</span>
                  </div>
                </div>

                <div class="absolute -bottom-6 -left-6 bg-yellow-400 text-gray-900 p-4 rounded-2xl shadow-lg border-4 border-white transform -rotate-3 transition-transform duration-500 group-hover:rotate-0">
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-zap" class="w-5 h-5 fill-gray-900" />
                    <span class="font-black text-sm">Brzo i pažljivo</span>
                  </div>
                </div>
              </div>

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
