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
          <UButton color="warning" variant="solid" label="Provjeri i naruči" icon="i-lucide-arrow-right" trailing to="#calculator" class="font-bold text-black" />
        </div>
      </UContainer>
    </header>

    <main class="flex-grow">
      <!-- HERO SEKCIJA I GLAVNI WIZARD -->
      <section id="calculator" class="relative pt-12 pb-20 lg:pt-24 lg:pb-32 bg-gray-50">
        <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div class="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-yellow-400/20 rounded-full blur-3xl"></div>
        </div>

        <UContainer class="relative z-10">
          <div class="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">

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
                Zalijepite svoj popis za kupovinu, odmah saznajte cijenu i rezervirajte prvi slobodan termin u našem vozilu.
              </p>

              <div class="flex items-center gap-4 text-sm font-bold text-gray-500">
                <div class="flex items-center gap-1.5">
                  <UIcon name="i-lucide-check-circle-2" class="w-5 h-5 text-green-500" />
                  Trenutni izračun cijene
                </div>
                <div class="flex items-center gap-1.5">
                  <UIcon name="i-lucide-check-circle-2" class="w-5 h-5 text-green-500" />
                  Preuzimanje iz Paketomata
                </div>
              </div>
            </div>

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
            <h2 class="text-3xl lg:text-4xl font-extrabold mb-4 text-gray-900">Kako funkcionira naručivanje?</h2>
            <p class="text-gray-600 text-lg">Proces je prilagođen vama, bez dugih čekanja i kompliciranih dogovora.</p>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            <div class="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-gray-200 via-yellow-400 to-gray-200 z-0"></div>

            <div class="relative z-10 flex flex-col items-center text-center group">
              <div class="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 mb-6 group-hover:-translate-y-2 transition-transform duration-300">
                <UIcon name="i-lucide-calculator" class="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <div class="w-8 h-8 rounded-full bg-gray-900 text-white font-bold flex items-center justify-center text-sm absolute top-20 -mr-20 border-4 border-white shadow-sm">1</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Provjerite cijenu</h3>
              <p class="text-sm text-gray-600 leading-relaxed">Kopirajte link svog IKEA popisa u naš alat. Odmah ćete saznati cijenu dostave i imamo li slobodan termin.</p>
            </div>

            <div class="relative z-10 flex flex-col items-center text-center group">
              <div class="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 mb-6 group-hover:-translate-y-2 transition-transform duration-300">
                <UIcon name="i-lucide-shopping-cart" class="w-10 h-10 text-gray-400 group-hover:text-yellow-500 transition-colors" />
              </div>
              <div class="w-8 h-8 rounded-full bg-gray-900 text-white font-bold flex items-center justify-center text-sm absolute top-20 -mr-20 border-4 border-white shadow-sm">2</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Naručite u IKEA-i</h3>
              <p class="text-sm text-gray-600 leading-relaxed">Obavite kupnju na IKEA webshopu i pod način preuzimanja obavezno odaberite <strong>IKEA Paketomat</strong>.</p>
            </div>

            <div class="relative z-10 flex flex-col items-center text-center group">
              <div class="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 mb-6 group-hover:-translate-y-2 transition-transform duration-300">
                <UIcon name="i-lucide-clipboard-check" class="w-10 h-10 text-gray-400 group-hover:text-green-500 transition-colors" />
              </div>
              <div class="w-8 h-8 rounded-full bg-gray-900 text-white font-bold flex items-center justify-center text-sm absolute top-20 -mr-20 border-4 border-white shadow-sm">3</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Rezervirajte dostavu</h3>
              <p class="text-sm text-gray-600 leading-relaxed">Vratite se ovdje, upišite svoj broj narudžbe iz IKEA-e i adresu na koju vozimo vaše pakete.</p>
            </div>

            <div class="relative z-10 flex flex-col items-center text-center group">
              <div class="w-24 h-24 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg border border-yellow-500 mb-6 group-hover:-translate-y-2 transition-transform duration-300">
                <UIcon name="i-lucide-smartphone" class="w-10 h-10 text-gray-900" />
              </div>
              <div class="w-8 h-8 rounded-full bg-gray-900 text-white font-bold flex items-center justify-center text-sm absolute top-20 -mr-20 border-4 border-white shadow-sm">4</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Pošaljite nam PIN</h3>
              <p class="text-sm text-gray-600 leading-relaxed">Kada vam IKEA pošalje SMS s PIN kodom za ormarić, proslijedite nam ga. Mi preuzimamo i dolazimo!</p>
            </div>
          </div>
        </UContainer>
      </section>

      <!-- CJENIK (AŽURIRAN PREMA KATEGORIJAMA) -->
      <section id="pricing" class="py-20 bg-gray-900 text-white border-y border-gray-800 relative z-20 overflow-hidden">
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-500/10 via-gray-900 to-gray-900 pointer-events-none"></div>
        <UContainer class="relative z-10">
          <div class="text-center max-w-3xl mx-auto mb-16">
            <h2 class="text-3xl lg:text-4xl font-extrabold mb-4 text-white">Transparentan cjenik</h2>
            <p class="text-gray-400 text-lg">Konkurentni smo službenim cijenama robnih kuća. Fiksne cijene po kategorijama, <strong class="text-white">bez ikakvih skrivenih doplata</strong> (osim ako ne želite unos u prostoriju).</p>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Kategorija 1 -->
            <div class="bg-gray-800 rounded-2xl p-6 border border-gray-700 flex flex-col relative overflow-hidden">
              <div class="mb-4 bg-gray-700/50 w-12 h-12 rounded-lg flex items-center justify-center"><UIcon name="i-lucide-package" class="w-6 h-6 text-yellow-400" /></div>
              <h3 class="text-xl font-bold mb-1">Standardni paket</h3>
              <p class="text-sm text-gray-400 mb-4 flex-grow">Za manje narudžbe, sitnice, posuđe i tekstil do 15 kg. <br><br><em class="text-gray-500 line-through">IKEA naplaćuje: od 6,99 €</em></p>
              <p class="text-3xl font-black text-white">5 €</p>
            </div>

            <!-- Kategorija 2 -->
            <div class="bg-gray-800 rounded-2xl p-6 border border-gray-700 flex flex-col">
              <div class="mb-4 bg-gray-700/50 w-12 h-12 rounded-lg flex items-center justify-center"><UIcon name="i-lucide-boxes" class="w-6 h-6 text-yellow-400" /></div>
              <h3 class="text-xl font-bold mb-1">Veliki paket</h3>
              <p class="text-sm text-gray-400 mb-4 flex-grow">Za srednje pakete, manje police, stolice i rasvjetu do 30 kg. Kod nas nema naglih skokova cijene!</p>
              <p class="text-3xl font-black text-white">10 €</p>
            </div>

            <!-- Kategorija 3 -->
            <div class="bg-gray-800 rounded-2xl p-6 border border-gray-700 flex flex-col">
              <div class="mb-4 bg-gray-700/50 w-12 h-12 rounded-lg flex items-center justify-center"><UIcon name="i-lucide-sofa" class="w-6 h-6 text-yellow-400" /></div>
              <h3 class="text-xl font-bold mb-1">Namještaj</h3>
              <p class="text-sm text-gray-400 mb-4 flex-grow">Za veće i teže komade namještaja poput ormara i kreveta. Točna cijena se računa u aplikaciji. <br><br><em class="text-gray-500 line-through">IKEA naplaćuje: od 54,99 €</em></p>
              <div class="flex items-baseline gap-1">
                <span class="text-lg text-gray-400 font-bold">od</span>
                <p class="text-3xl font-black text-white">30 €</p>
              </div>
            </div>

            <!-- Unos -->
            <div class="bg-yellow-400 text-gray-900 rounded-2xl p-6 border border-yellow-500 flex flex-col relative overflow-hidden">
              <div class="absolute -right-4 -bottom-4 opacity-10"><UIcon name="i-lucide-home" class="w-32 h-32" /></div>
              <div class="mb-4 bg-yellow-300/50 w-12 h-12 rounded-lg flex items-center justify-center relative z-10"><UIcon name="i-lucide-arrow-up-circle" class="w-6 h-6 text-gray-900" /></div>
              <h3 class="text-xl font-bold mb-1 relative z-10">Unos u prostoriju</h3>
              <p class="text-sm text-gray-800 mb-4 flex-grow relative z-10"><strong>Jedina moguća doplata.</strong> Pokriva trošak još jedne osobe za nošenje teških komada u vaš dom.<br><br><em class="opacity-70 line-through">IKEA naplaćuje: 89,99 € - 119,99 €</em></p>
              <p class="text-3xl font-black relative z-10">+ 25 €</p>
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
              <p class="text-sm text-gray-600 leading-relaxed">Prilikom kupnje na webshopu navedite ime našeg dostavljača koji će u vaše ime preuzeti robu, kako biste bili bezbrižni.</p>
            </UCard>
            <UCard class="hover:border-yellow-500 transition-colors shadow-sm bg-white">
              <h3 class="text-xl font-bold mb-2 text-gray-900">Preuzimanje iz paketomata</h3>
              <p class="text-sm text-gray-600 leading-relaxed">Usmjerite narudžbe u IKEA paketomat, proslijedite nam PIN kod čim ga dobijete i mi robu preuzimamo za vas.</p>
            </UCard>
            <UCard class="hover:border-yellow-500 transition-colors shadow-sm bg-white">
              <h3 class="text-xl font-bold mb-2 text-gray-900">Bez prekrcavanja</h3>
              <p class="text-sm text-gray-600 leading-relaxed">Vaša roba ide iz robne kuće direktno u naše vozilo i na vašu adresu, bez stajanja i pretumbavanja u ogromnim sortirnim centrima.</p>
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
