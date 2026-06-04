<script setup lang="ts">
import { ref } from 'vue'

// SEO Meta
useHead({
  title: 'Podrška i Česta pitanja | Usput',
  meta: [
    { name: 'description', content: 'Imate pitanje o Usput dostavi? Pronađite odgovore na najčešća pitanja ili kontaktirajte našu podršku.' }
  ]
})

// FAQ Podaci za UAccordion komponentu
const faqItems = [
  {
    label: 'Nosite li namještaj na više katove ako zgrada nema lift?',
    content: 'Da! Naša usluga "Unos u prostoriju" pokriva nošenje namještaja do vaših vrata, bez obzira na to imate li lift. Ako živite na 4. katu bez lifta, naš vozač će paket donijeti do vašeg hodnika. Molimo vas samo da to napomenete prilikom narudžbe kako bismo adekvatno planirali vrijeme.'
  },
  {
    label: 'Što ako nisam kod kuće u vrijeme dostave?',
    content: 'Naš vozač će vas kontaktirati (pozivom ili SMS-om) 15-30 minuta prije dolaska. Ako niste kod kuće, možemo ostaviti paket pred vratima (uz vašu pisanu suglasnost u SMS-u) ili ga možemo predati susjedu. Ako ni to nije moguće, povratak paketa u skladište i ponovna dostava mogu naplatiti dodatne troškove.'
  },
  {
    label: 'Sastavljate li namještaj nakon dostave?',
    content: 'Trenutno ne nudimo uslugu montaže namještaja. Platforma Usput specijalizirana je isključivo za brz, siguran i točan transport vaših paketa od robne kuće do vašeg doma.'
  },
  {
    label: 'Što ako u IKEA-i nema artikla koji sam naručio/la?',
    content: 'Ako vozač prilikom prikupa primijeti da neki od vaših artikala nije na zalihi, preuzet će ono što je dostupno. Vi ćete biti odmah obaviješteni, a cijena dostave bit će automatski korigirana (umanjena) sukladno novom, manjem volumenu.'
  },
  {
    label: 'Kako mogu pratiti svoju pošiljku?',
    content: 'Nakon što vozač preuzme vašu narudžbu, dobit ćete SMS s jedinstvenim linkom. Klikom na taj link otvara se naša stranica za praćenje gdje u realnom vremenu vidite status dostave i procijenjeno vrijeme dolaska (ETA).'
  },
  {
    label: 'Mogu li otkazati dostavu?',
    content: 'Besplatno otkazivanje moguće je do 24 sata prije zakazanog termina dostave. Za otkazivanja unutar 24 sata zadržavamo pravo naplate 30% iznosa dostave zbog rezervacije tovarnog prostora u kombiju.'
  }
]
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans text-neutral-900 pb-20">

    <header class="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm w-full">
      <div class="w-full max-w-[1400px] mx-auto flex items-center justify-between py-4 px-4 sm:px-6 lg:px-8">
        <NuxtLink to="/" class="flex items-center gap-2 text-xl font-bold hover:opacity-80 transition-opacity">
          <span>Usput<span class="text-yellow-500">.</span></span>
        </NuxtLink>
        <UButton color="gray" variant="ghost" to="/login" class="font-bold">
          Moj profil
        </UButton>
      </div>
    </header>

    <main class="pt-12 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-[1000px] mx-auto">

        <div class="text-center mb-12">
          <div class="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-yellow-200">
            <UIcon name="i-lucide-life-buoy" class="w-8 h-8" />
          </div>
          <h1 class="text-4xl font-black text-gray-950 mb-4">Kako vam možemo pomoći?</h1>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">Pronađite odgovore na najčešća pitanja o našoj usluzi dostave ili kontaktirajte naš tim za korisničku podršku.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          <div class="lg:col-span-8 w-full">
            <UCard class="shadow-sm border border-gray-200 rounded-3xl bg-white w-full overflow-hidden" :ui="{ body: { padding: 'p-2 sm:p-4' } }">
              <UAccordion
                :items="faqItems"
                color="gray"
                variant="ghost"
                size="xl"
                class="w-full"
                :ui="{
                  item: { padding: 'pt-2 pb-6 px-4 text-gray-600 leading-relaxed' },
                  default: { class: 'mb-2 font-bold text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors px-4 py-3' }
                }"
              />
            </UCard>
          </div>

          <div class="lg:col-span-4 space-y-6 w-full">
            <UCard class="shadow-sm border border-yellow-200 rounded-3xl bg-yellow-50 w-full">
              <div class="p-6 text-center space-y-4">
                <div class="w-12 h-12 bg-white text-yellow-600 rounded-full flex items-center justify-center mx-auto shadow-sm border border-yellow-100">
                  <UIcon name="i-lucide-phone-call" class="w-6 h-6" />
                </div>
                <div>
                  <h3 class="font-bold text-gray-950">Trebate hitnu pomoć?</h3>
                  <p class="text-sm text-gray-600 mt-1 mb-4">Naša linija je otvorena pon-sub od 08:00 do 20:00.</p>
                  <a href="tel:+385912345678" class="text-xl font-black text-yellow-700 hover:text-yellow-800 transition-colors block">
                    +385 91 234 5678
                  </a>
                </div>
              </div>
            </UCard>

            <UCard class="shadow-sm border border-gray-200 rounded-3xl bg-white w-full">
              <div class="p-6 text-center space-y-4">
                <div class="w-12 h-12 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center mx-auto border border-gray-100">
                  <UIcon name="i-lucide-mail" class="w-6 h-6" />
                </div>
                <div>
                  <h3 class="font-bold text-gray-950">Nije hitno?</h3>
                  <p class="text-sm text-gray-600 mt-1 mb-4">Pošaljite nam email s detaljima narudžbe. Odgovaramo unutar 24 sata.</p>
                  <a href="mailto:podrska@usput.hr" class="text-base font-bold text-gray-900 hover:underline">
                    podrska@usput.hr
                  </a>
                </div>
              </div>
            </UCard>
          </div>

        </div>
      </div>
    </main>
  </div>
</template>
