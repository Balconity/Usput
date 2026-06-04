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

      <section id="services" class="py-20 bg-white border-y border-gray-200">
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

      <section id="assembly" class="py-20 bg-gray-900 text-white relative overflow-hidden">
        <div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-400 via-transparent to-transparent"></div>
        <UContainer class="relative z-10">
          <div class="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 text-yellow-400 font-bold text-sm mb-6 border border-yellow-400/20">
                <UIcon name="i-lucide-hammer" class="w-4 h-4" />
                <span>Dodatna usluga</span>
              </div>
              <h2 class="text-4xl font-extrabold mb-6 leading-tight">Nemate vremena ili alata za sastavljanje?</h2>
              <p class="text-lg text-gray-400 mb-8 leading-relaxed">
                Riješite se muke s uputama i vijcima. Povezujemo vas s provjerenim lokalnim majstorima na relaciji Zagreb - Varaždin koji će vaš novi namještaj sastaviti stručno i brzo, odmah nakon dostave.
              </p>

              <ul class="space-y-4 mb-8">
                <li class="flex items-center gap-3 text-gray-300 font-medium">
                  <div class="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0 border border-gray-700">
                    <UIcon name="i-lucide-check" class="text-yellow-400 w-4 h-4" />
                  </div>
                  Provjereni i iskusni lokalni majstori
                </li>
                <li class="flex items-center gap-3 text-gray-300 font-medium">
                  <div class="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0 border border-gray-700">
                    <UIcon name="i-lucide-check" class="text-yellow-400 w-4 h-4" />
                  </div>
                  Dolazak u terminu koji vama odgovara
                </li>
                <li class="flex items-center gap-3 text-gray-300 font-medium">
                  <div class="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0 border border-gray-700">
                    <UIcon name="i-lucide-check" class="text-yellow-400 w-4 h-4" />
                  </div>
                  Usluga se plaća direktno majstoru po obavljenom poslu
                </li>
              </ul>

              <UButton size="xl" color="warning" class="font-bold text-black" icon="i-lucide-arrow-down" to="#contact">
                Zatraži ponudu uz dostavu
              </UButton>
            </div>

            <div class="relative">
              <div class="absolute inset-0 bg-gradient-to-tr from-yellow-400/20 to-transparent rounded-3xl transform rotate-3 scale-105 blur-lg"></div>
              <UCard class="bg-gray-800 border-gray-700 relative z-10 shadow-2xl rounded-3xl overflow-hidden">
                <div class="p-8 text-center">
                  <div class="w-20 h-20 mx-auto bg-gray-900 rounded-2xl flex items-center justify-center border border-gray-700 mb-6 shadow-inner">
                    <UIcon name="i-lucide-wrench" class="w-10 h-10 text-yellow-400" />
                  </div>
                  <h3 class="text-2xl font-bold text-white mb-2">Ključ u ruke</h3>
                  <p class="text-gray-400 mb-6">Samo odaberite opciju "Želim ponudu za montažu" u formi ispod, a naš partnerski majstor će vas kontaktirati s točnom procjenom cijene prema vašoj narudžbi.</p>
                </div>
              </UCard>
            </div>
          </div>
        </UContainer>
      </section>

      <section id="contact" class="py-20 bg-gray-50 border-t border-gray-200">
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
      <UContainer class="flex flex-col md:flex-row justify-between items-center gap-6">
        <div class="flex items-center gap-2 text-xl font-bold opacity-50 grayscale">
          <span>Usput</span>
        </div>
        <p class="text-sm text-gray-500 text-center">
          &copy; {{ new Date().getFullYear() }} Usput. Sva prava pridržana.
        </p>
      </UContainer>
    </footer>
  </div>
</template>
