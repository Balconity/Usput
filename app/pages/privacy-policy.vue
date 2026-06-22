<script setup lang="ts">
// Postavljanje naslova stranice za SEO
useHead({
  title: 'Pravila privatnosti | Usput',
  meta: [
    { name: 'description', content: 'Saznajte kako Usput prikuplja, koristi i štiti vaše osobne podatke.' }
  ]
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans text-neutral-900 pb-20">
    <AppHeader/>

    <main class="pt-12">
      <UContainer class="max-w-[800px] bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-200">
        <h1 class="text-4xl font-extrabold text-gray-900 mb-4">Pravila privatnosti</h1>
        <p class="text-gray-500 mb-8 font-medium">Zadnje ažurirano: 1. lipnja 2026.</p>

        <div class="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 class="text-2xl font-bold text-gray-900 mb-3">1. Uvod</h2>
            <p>Vaša privatnost nam je važna. Ova Pravila privatnosti objašnjavaju kako platforma Usput ("mi", "naš", "nas") prikuplja, koristi i štiti vaše osobne podatke kada koristite našu web stranicu i usluge logistike.</p>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-gray-900 mb-3">2. Podaci koje prikupljamo</h2>
            <p>Kada kreirate račun ili naručite dostavu, prikupljamo sljedeće podatke:</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
              <li>Ime i prezime</li>
              <li>Email adresa</li>
              <li>Broj telefona</li>
              <li>Adresa dostave</li>
              <li>Informacije o naručenim proizvodima (PDF računi, poveznice)</li>
            </ul>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-gray-900 mb-3">3. Kako koristimo vaše podatke</h2>
            <p>Vaše podatke koristimo isključivo u sljedeće svrhe:</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
              <li>Izvršavanje usluge dostave (dijeljenje adrese i broja telefona s našim vozačima).</li>
              <li>Komunikacija vezana uz status vaše pošiljke.</li>
              <li>Pružanje korisničke podrške.</li>
              <li>Poboljšanje naših logističkih algoritama.</li>
            </ul>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-gray-900 mb-3">4. Sigurnost podataka</h2>
            <p>Vaši podaci sigurno su pohranjeni koristeći infrastrukturu Amazon Web Services (AWS Cognito i DynamoDB) koji su u skladu s najvišim industrijskim standardima. Lozinke su kriptirane i mi im nemamo pristup.</p>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-gray-900 mb-3">5. Vaša prava (GDPR)</h2>
            <p>U skladu s Općom uredbom o zaštiti podataka (GDPR), imate pravo zatražiti pregled, izmjenu ili potpuno brisanje vaših osobnih podataka iz našeg sustava. Zahtjeve možete poslati na <strong>admin@usput.hr</strong>.</p>
          </section>
        </div>
      </UContainer>
    </main>
  </div>
</template>
