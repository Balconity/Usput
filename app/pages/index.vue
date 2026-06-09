<script setup lang="ts">
const colorMode = useColorMode()
colorMode.preference = 'light'

const appConfig = useAppConfig()
appConfig.ui.primary = 'yellow'
appConfig.ui.gray = 'neutral'
</script>

<template>
  <div class="min-h-screen flex flex-col font-sans bg-gray-50 text-neutral-900 selection:bg-yellow-400 selection:text-black">

    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <UContainer class="flex items-center justify-between py-4">
        <div class="flex items-center gap-2 text-xl font-bold">
          <span>Usput<span class="text-yellow-500">.</span></span>
        </div>
        <div class="flex items-center gap-4">
          <NuxtLink to="/login" class="text-sm font-bold text-gray-600 hover:text-yellow-500 transition-colors">
            Prijava
          </NuxtLink>
          <UButton color="warning" variant="solid" label="Naruči dostavu" icon="i-lucide-arrow-right" trailing to="#contact" />
        </div>
      </UContainer>
    </header>

    <main class="flex-grow">
      <!-- HERO SEKCIJA S KALKULATOROM -->
      <section class="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden bg-gray-50">
        <div class="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-yellow-400/20 rounded-full blur-3xl pointer-events-none"></div>

        <UContainer>
          <div class="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            <div class="lg:col-span-6 pt-4">
              <h1 class="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight text-gray-900">
                Pametnija dostava.<br/>
                Ne isplati se ako nije <span class="text-yellow-500">usput.</span>
              </h1>
              <p class="text-lg text-gray-600 mt-8 leading-relaxed pr-4">
                Dostavljamo vaše <strong class="text-[#0057AD]">IKEA</strong> pakete iz Zagreba direktno na vaša vrata (koridor Varaždin).
                Zašto plaćati punu cijenu službene logistike? Naručite svoj paket, a mi vam ga donosimo brzo i sigurno jer ionako putujemo u tom smjeru.
              </p>
            </div>

            <div class="lg:col-span-6 relative z-10">
              <!-- Nova VolumeCalculator komponenta -->
              <VolumeCalculator />
            </div>
          </div>
        </UContainer>
      </section>

      <!-- NOVA SEKCIJA: KAKO FUNKCIONIRA (UPUTE) -->
      <section id="how-it-works" class="py-20 bg-white border-y border-gray-200">
        <UContainer>
          <div class="text-center max-w-3xl mx-auto mb-16">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-bold text-sm mb-4 border border-blue-100">
              <UIcon name="i-lucide-list-checks" class="w-4 h-4" />
              <span>Jednostavan proces</span>
            </div>
            <h2 class="text-3xl lg:text-4xl font-extrabold mb-4 text-gray-900">Od webshopa do vaših vrata</h2>
            <p class="text-lg text-gray-600">
              Ne znate stane li narudžba u vaš automobil? Slijedite ova 4 brza koraka i odmah saznajte.
            </p>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            <!-- Linija koja spaja korake (vidljiva samo na velikim ekranima) -->
            <div class="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-gray-200 via-yellow-400 to-gray-200 z-0"></div>

            <!-- Korak 1 -->
            <div class="relative z-10 flex flex-col items-center text-center group">
              <div class="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 mb-6 group-hover:-translate-y-2 transition-transform duration-300">
                <UIcon name="i-lucide-heart" class="w-10 h-10 text-gray-400 group-hover:text-red-500 transition-colors" />
              </div>
              <div class="w-8 h-8 rounded-full bg-gray-900 text-white font-bold flex items-center justify-center text-sm absolute top-20 -mr-20 border-4 border-white shadow-sm">1</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Spremite proizvode</h3>
              <p class="text-sm text-gray-600 leading-relaxed">
                Pronađite željene proizvode u IKEA aplikaciji ili na webu i kliknite na ikonu srca kako biste ih dodali na svoj <strong>Popis za kupovinu</strong>.
              </p>
            </div>

            <!-- Korak 2 -->
            <div class="relative z-10 flex flex-col items-center text-center group">
              <div class="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 mb-6 group-hover:-translate-y-2 transition-transform duration-300">
                <UIcon name="i-lucide-share-2" class="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <div class="w-8 h-8 rounded-full bg-gray-900 text-white font-bold flex items-center justify-center text-sm absolute top-20 -mr-20 border-4 border-white shadow-sm">2</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Kopirajte link</h3>
              <p class="text-sm text-gray-600 leading-relaxed">
                Otvorite svoj popis, pronađite opciju <strong>Podijeli</strong> (Share) i odaberite "Kopiraj poveznicu". To je sve što nam treba!
              </p>
            </div>

            <!-- Korak 3 -->
            <div class="relative z-10 flex flex-col items-center text-center group">
              <div class="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 mb-6 group-hover:-translate-y-2 transition-transform duration-300">
                <UIcon name="i-lucide-calculator" class="w-10 h-10 text-gray-400 group-hover:text-yellow-500 transition-colors" />
              </div>
              <div class="w-8 h-8 rounded-full bg-gray-900 text-white font-bold flex items-center justify-center text-sm absolute top-20 -mr-20 border-4 border-white shadow-sm">3</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Provjerite volumen</h3>
              <p class="text-sm text-gray-600 leading-relaxed">
                Zalijepite link u naš kalkulator iznad. Sustav će u sekundi izračunati stane li vaša narudžba u osobni automobil.
              </p>
            </div>

            <!-- Korak 4 -->
            <div class="relative z-10 flex flex-col items-center text-center group">
              <div class="w-24 h-24 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg border border-yellow-500 mb-6 group-hover:-translate-y-2 transition-transform duration-300">
                <UIcon name="i-lucide-truck" class="w-10 h-10 text-gray-900" />
              </div>
              <div class="w-8 h-8 rounded-full bg-gray-900 text-white font-bold flex items-center justify-center text-sm absolute top-20 -mr-20 border-4 border-white shadow-sm">4</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Naručite Usput</h3>
              <p class="text-sm text-gray-600 leading-relaxed">
                Ako vam treba kombi, dovršite narudžbu na IKEA webu (Click&Collect), pošaljite nam potvrdu i mi preuzimamo dostavu.
              </p>
            </div>
          </div>
        </UContainer>
      </section>

      <!-- SEKCIJA: LOGISTIKA -->
      <section id="services" class="py-20 bg-gray-50 border-y border-gray-200">
        <UContainer>
          <div class="text-center max-w-2xl mx-auto mb-16">
            <h2 class="text-3xl font-bold mb-4">Logistika prilagođena vama</h2>
            <p class="text-gray-600">Od preuzimanja paketa do dostave u prostoriju nakon radnog vremena.</p>
          </div>

          <div class="grid md:grid-cols-4 gap-8">
            <UCard class="hover:border-yellow-500 transition-colors">
              <h3 class="text-xl font-bold mb-2">Kod kreiranja narudžbe naglasite da će treća strana preuzeti paket</h3>
              <p class="text-gray-600">U napomenu za preuzimanje navedite Usput kao kurira koji će preuzeti Vaše pakete</p>
            </UCard>
            <UCard class="hover:border-yellow-500 transition-colors">
              <h3 class="text-xl font-bold mb-2">Detekcija volumena</h3>
              <p class="text-gray-600">Kod kreiranja zahtjeva za dostavu slikajte račun. Odmah ćete dobiti informaciju kada možete očekivati isporuku</p>
            </UCard>
            <UCard class="hover:border-yellow-500 transition-colors">
              <h3 class="text-xl font-bold mb-2">Preuzimanje iz paketomata</h3>
              <p class="text-gray-600">Usmjerite narudžbe u paketomat i pošaljite nam PIN za preuzimanje paketa</p>
            </UCard>
            <UCard class="hover:border-yellow-500 transition-colors">
              <h3 class="text-xl font-bold mb-2">Praćenje paketa uživo</h3>
              <p class="text-gray-600">Dijelimo Vam lokaciju cijelim putem dok smo na putu prema Vama</p>
            </UCard>
          </div>
        </UContainer>
      </section>

      <!-- SEKCIJA: KONTAKT / NARUDŽBA -->
      <section id="contact" class="py-20 bg-white border-t border-gray-200">
        <UContainer class="max-w-3xl">
          <div class="text-center mb-10">
            <h2 class="text-3xl font-bold mb-4">Naruči dostavu</h2>
            <p class="text-gray-600">Priložite IKEA potvrdu narudžbe i podatke za prikup, a mi preuzimamo brigu o logistici.</p>
          </div>

          <!-- Nova OrderForm komponenta -->
          <OrderForm />

        </UContainer>
      </section>
    </main>

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
            <a
              href="https://balconity.com"
              target="_blank"
              rel="noopener noreferrer"
              class="font-bold text-gray-500 hover:text-yellow-600 transition-colors flex items-center gap-1"
            >
              Balconity
              <UIcon name="i-lucide-external-link" class="w-3 h-3" />
            </a>
          </p>
        </div>

      </UContainer>
    </footer>
  </div>
</template>
