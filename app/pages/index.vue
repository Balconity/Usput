<script setup lang="ts">
const colorMode = useColorMode()
colorMode.preference = 'light'

const appConfig = useAppConfig()
appConfig.ui.primary = 'yellow'
appConfig.ui.gray = 'neutral'
</script>

<template>
  <div class="min-h-screen flex flex-col font-sans bg-gray-50 text-neutral-900 selection:bg-yellow-400 selection:text-black scroll-smooth">

    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <UContainer class="flex items-center justify-between py-4">
        <div class="flex items-center gap-2 text-xl font-bold">
          <span>Usput<span class="text-yellow-500">.</span></span>
        </div>
        <div class="flex items-center gap-4">
          <NuxtLink to="/login" class="text-sm font-bold text-gray-600 hover:text-yellow-500 transition-colors">
            Prijava
          </NuxtLink>
          <!-- Gumb vodi direktno na početak našeg novog Booking Wizarda -->
          <UButton color="warning" variant="solid" label="Provjeri i naruči" icon="i-lucide-arrow-right" trailing to="#calculator" class="font-bold text-black" />
        </div>
      </UContainer>
    </header>

    <main class="flex-grow">
      <!-- HERO SEKCIJA I GLAVNI WIZARD (Kalkulator + Forma) -->
      <section id="calculator" class="relative pt-12 pb-20 lg:pt-24 lg:pb-32 bg-gray-50">
        <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div class="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-yellow-400/20 rounded-full blur-3xl"></div>
        </div>

        <UContainer class="relative z-10">
          <div class="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">

            <!-- Lijeva strana (Tekstualni dio) -->
            <div class="lg:col-span-6 pt-4 lg:sticky lg:top-32">
              <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-800 font-bold text-xs mb-6 border border-yellow-200 shadow-sm">
                <UIcon name="i-lucide-map-pin" class="w-4 h-4" />
                <span>Ruta: Zagreb &rarr; Varaždin (i okolica)</span>
              </div>

              <h1 class="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight text-gray-900 mb-6">
                Pametnija dostava.<br/>
                Ne isplati se ako nije <span class="text-yellow-500">usput.</span>
              </h1>

              <p class="text-lg text-gray-600 leading-relaxed max-w-lg mb-8">
                Dostavljamo vaše <strong class="text-[#0057AD]">IKEA</strong> pakete iz Zagreba direktno na vaša vrata.
                Budući da koristimo jedno osobno dostavno vozilo, slijedite korake u našem alatu kako biste provjerili slobodne termine, gabarite i rezervirali svoju dostavu.
              </p>

              <div class="flex items-center gap-4 text-sm font-bold text-gray-500">
                <div class="flex items-center gap-1.5">
                  <UIcon name="i-lucide-check-circle-2" class="w-5 h-5 text-green-500" />
                  Automatska provjera gabarita
                </div>
                <div class="flex items-center gap-1.5">
                  <UIcon name="i-lucide-check-circle-2" class="w-5 h-5 text-green-500" />
                  Plaćanje tek po odobrenju
                </div>
              </div>
            </div>

            <!-- Desna strana (Sada je to cijeli proces u jednoj komponenti) -->
            <div class="lg:col-span-6 relative z-10">
              <VolumeCalculator />
            </div>

          </div>
        </UContainer>
      </section>

      <!-- KAKO FUNKCIONIRA -->
      <section id="how-it-works" class="py-20 bg-white border-y border-gray-200 relative z-20">
        <UContainer>
          <div class="text-center max-w-3xl mx-auto mb-16">
            <h2 class="text-3xl lg:text-4xl font-extrabold mb-4 text-gray-900">Kako funkcionira naša dostava?</h2>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            <div class="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-gray-200 via-yellow-400 to-gray-200 z-0"></div>

            <div class="relative z-10 flex flex-col items-center text-center group">
              <div class="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 mb-6 group-hover:-translate-y-2 transition-transform duration-300">
                <UIcon name="i-lucide-heart" class="w-10 h-10 text-gray-400 group-hover:text-red-500 transition-colors" />
              </div>
              <div class="w-8 h-8 rounded-full bg-gray-900 text-white font-bold flex items-center justify-center text-sm absolute top-20 -mr-20 border-4 border-white shadow-sm">1</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Spremite proizvode</h3>
              <p class="text-sm text-gray-600 leading-relaxed">Pronađite željene proizvode u IKEA aplikaciji i dodajte ih na svoj <strong>Popis za kupovinu</strong>.</p>
            </div>

            <div class="relative z-10 flex flex-col items-center text-center group">
              <div class="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 mb-6 group-hover:-translate-y-2 transition-transform duration-300">
                <UIcon name="i-lucide-share-2" class="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <div class="w-8 h-8 rounded-full bg-gray-900 text-white font-bold flex items-center justify-center text-sm absolute top-20 -mr-20 border-4 border-white shadow-sm">2</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Provjerite gabarite</h3>
              <p class="text-sm text-gray-600 leading-relaxed">Kopirajte poveznicu popisa u naš kalkulator kako bismo potvrdili da pošiljka stane u vozilo.</p>
            </div>

            <div class="relative z-10 flex flex-col items-center text-center group">
              <div class="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 mb-6 group-hover:-translate-y-2 transition-transform duration-300">
                <UIcon name="i-lucide-credit-card" class="w-10 h-10 text-gray-400 group-hover:text-yellow-500 transition-colors" />
              </div>
              <div class="w-8 h-8 rounded-full bg-gray-900 text-white font-bold flex items-center justify-center text-sm absolute top-20 -mr-20 border-4 border-white shadow-sm">3</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Kupite na webshopu</h3>
              <p class="text-sm text-gray-600 leading-relaxed">Platite robu direktno IKEA-i uz opciju preuzimanja u robnoj kući ili paketomatu.</p>
            </div>

            <div class="relative z-10 flex flex-col items-center text-center group">
              <div class="w-24 h-24 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg border border-yellow-500 mb-6 group-hover:-translate-y-2 transition-transform duration-300">
                <UIcon name="i-lucide-truck" class="w-10 h-10 text-gray-900" />
              </div>
              <div class="w-8 h-8 rounded-full bg-gray-900 text-white font-bold flex items-center justify-center text-sm absolute top-20 -mr-20 border-4 border-white shadow-sm">4</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Prepustite dostavu nama</h3>
              <p class="text-sm text-gray-600 leading-relaxed">Proslijedite nam PDF potvrdu unutar našeg alata. Mi robu preuzimamo i dovozimo direktno na vaša vrata.</p>
            </div>
          </div>
        </UContainer>
      </section>

      <!-- LOGISTIKA -->
      <section id="services" class="py-20 bg-gray-50 border-b border-gray-200">
        <UContainer>
          <div class="text-center max-w-2xl mx-auto mb-16">
            <h2 class="text-3xl font-bold mb-4">Mala logistika, velika prednost</h2>
            <p class="text-gray-600">Fokusirani smo isključivo na vaš paket i direktnu dostavu.</p>
          </div>

          <div class="grid md:grid-cols-3 gap-8">
            <UCard class="hover:border-yellow-500 transition-colors shadow-sm bg-white">
              <h3 class="text-xl font-bold mb-2 text-gray-900">Treća strana pri preuzimanju</h3>
              <p class="text-sm text-gray-600 leading-relaxed">U napomenu za preuzimanje prilikom kupnje na IKEA webu navedite "Usput" kao kurira koji će preuzeti Vaše pakete.</p>
            </UCard>
            <UCard class="hover:border-yellow-500 transition-colors shadow-sm bg-white">
              <h3 class="text-xl font-bold mb-2 text-gray-900">Preuzimanje iz paketomata</h3>
              <p class="text-sm text-gray-600 leading-relaxed">Usmjerite narudžbe u IKEA paketomat, pošaljite nam PIN kod i mi preuzimamo robu umjesto vas čim nam bude usput.</p>
            </UCard>
            <UCard class="hover:border-yellow-500 transition-colors shadow-sm bg-white">
              <h3 class="text-xl font-bold mb-2 text-gray-900">Bez prekrcavanja</h3>
              <p class="text-sm text-gray-600 leading-relaxed">Vaša roba ide iz robne kuće direktno u naše vozilo i na vašu adresu, bez stajanja u prašnjavim sortirnim centrima.</p>
            </UCard>
          </div>
        </UContainer>
      </section>
    </main>

    <!-- FOOTER -->
    <footer class="bg-gray-100 py-12 border-t border-gray-200">
      <UContainer class="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
        <div class="flex flex-col items-center md:items-start gap-3">
          <div class="text-xl font-bold opacity-60 grayscale">
            <span>Usput<span class="text-yellow-500">.</span></span>
          </div>
          <div class="text-xs text-gray-400 max-w-sm text-center md:text-left leading-relaxed">
            <p>"Usput" je komercijalni naziv usluge dostave.</p>
            <p class="mt-1">
              Uslugu pruža i naplaćuje obrt <strong>Balconity</strong>,
              vl. Tomislav Levkuš, Ivanečka ulica 41, 42000 Varaždin, OIB: 82780381100.
            </p>
          </div>
        </div>
        <div class="flex flex-col items-center md:items-end gap-3">
          <p class="text-sm text-gray-500 font-medium">
            &copy; {{ new Date().getFullYear() }} Usput. Sva prava pridržana.
          </p>
          <div class="flex items-center gap-4 text-xs text-gray-400 mt-2">
            <a href="/terms-of-service" class="hover:text-gray-600 transition-colors">Uvjeti korištenja</a>
            <span>|</span>
            <a href="/privacy-policy" class="hover:text-gray-600 transition-colors">Politika privatnosti</a>
          </div>
          <p class="text-xs text-gray-400 mt-4 flex items-center gap-1.5">
            Powered by
            <a href="https://balconity.com" target="_blank" rel="noopener noreferrer" class="font-bold text-gray-500 hover:text-yellow-600 transition-colors flex items-center gap-1">
              Balconity
              <UIcon name="i-lucide-external-link" class="w-3 h-3" />
            </a>
          </p>
        </div>
      </UContainer>
    </footer>
  </div>
</template>
