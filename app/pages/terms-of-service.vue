<script setup lang="ts">
useHead({
  title: 'Uvjeti korištenja | Usput',
  meta: [
    { name: 'description', content: 'Uvjeti korištenja i pravila logističke platforme Usput.' }
  ]
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans text-neutral-900 pb-20">
    <AppHeader/>

    <main class="pt-12">
      <UContainer class="max-w-[800px] bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-200">
        <h1 class="text-4xl font-extrabold text-gray-900 mb-4">Uvjeti korištenja</h1>
        <p class="text-gray-500 mb-8 font-medium">Zadnje ažurirano: 1. lipnja 2026.</p>

        <div class="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 class="text-2xl font-bold text-gray-900 mb-3">1. Prihvaćanje uvjeta</h2>
            <p>Korištenjem usluga platforme Usput, u potpunosti prihvaćate ove Uvjete korištenja. Ukoliko se ne slažete s bilo kojim dijelom ovih uvjeta, molimo vas da ne koristite naše usluge.</p>
          </section>

          <section>
            <div class="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-4">
              <h2 class="text-lg font-bold text-yellow-900 mb-2">Važna napomena o neovisnosti</h2>
              <p class="text-sm text-yellow-800">
                <strong>Platforma Usput posluje kao neovisna kurirska i logistička služba.</strong> Nismo povezani, sponzorirani niti ovlašteni od strane tvrtke IKEA Systems B.V. Svi nazivi brendova i zaštitni znakovi vlasništvo su njihovih poštovanih vlasnika i na ovoj se platformi koriste isključivo u svrhu identifikacije proizvoda za transport.
              </p>
            </div>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-gray-900 mb-3">2. Predmet usluge</h2>
            <p>Usput pruža uslugu preuzimanja naručenih i plaćenih paketa u ime naručitelja iz trgovina i paketomata te njihovu dostavu na adresu naručitelja. Korisnik je dužan osigurati točnost svih podataka (PIN za paketomat, adresa, kontakt broj).</p>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-gray-900 mb-3">3. Cijene i plaćanje</h2>
            <p>Cijena usluge transporta izračunava se na temelju volumena i težine vaših proizvoda. U trenutnoj fazi (MVP), usluga se naplaćuje izravno dostavljaču prilikom preuzimanja paketa, osim ako nije drugačije dogovoreno.</p>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-gray-900 mb-3">4. Ograničenje odgovornosti</h2>
            <p>Preuzimamo odgovornost za transport paketa od trenutka utovara do trenutka predaje. Usput nije odgovoran za eventualne tvorničke greške, nedostajuće dijelove ili oštećenja unutar originalno zapakiranih kutija koje je izdao prodavatelj (npr. IKEA).</p>
          </section>
        </div>
      </UContainer>
    </main>
  </div>
</template>
