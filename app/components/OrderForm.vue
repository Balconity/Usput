<script setup lang="ts">
import { reactive, ref } from 'vue'

const objectOptions = [
  { label: 'Kuća', value: 'kuca' },
  { label: 'Zgrada / Stan', value: 'zgrada' }
]

const contactState = reactive({
  name: '',
  phone: '',
  email: '',
  ikeaOrderNumber: '',
  ikeaPickupSlot: '',
  orderPdf: null as File | null,
  isLocker: false,
  lockerPin: '',
  street: '',
  city: '',
  zip: '42000', // Default Varaždin
  deliveryTerm: '',
  objectType: 'kuca',
  floor: '',
  notes: '',
  website: '' // HONEYPOT ZA BOTOVE
})

// UI State za poruke
const formError = ref('')
const formSuccess = ref('')
const isSubmitting = ref(false)

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    contactState.orderPdf = input.files[0]
    formError.value = '' // Očisti grešku ako je postojala
  }
}

async function onContactSubmit() {
  formError.value = ''
  formSuccess.value = ''

  // HONEYPOT PROVJERA: Ako je skriveno polje ispunjeno, to je sigurno bot
  if (contactState.website !== '') {
    console.warn('Bot detektiran!')
    return
  }

  // 1. Provjera obaveznih polja
  if (!contactState.name || !contactState.phone || !contactState.email || !contactState.ikeaOrderNumber || !contactState.ikeaPickupSlot || !contactState.street || !contactState.city || !contactState.zip) {
    formError.value = 'Molimo ispunite sva polja označena zvjezdicom (*).'
    return
  }

  // 2. Regex provjera za hrvatski broj mobitela
  const phoneRegex = /^(?:\+385|0)[1-9]\d{1,2}\s?\d{3}\s?\d{3,4}$/
  if (!phoneRegex.test(contactState.phone.trim())) {
    formError.value = 'Molimo unesite ispravan format broja mobitela (npr. 091 234 5678).'
    return
  }

  // 3. Provjera PDF-a
  if (!contactState.orderPdf) {
    formError.value = 'Molimo priložite PDF potvrdu narudžbe koju vam je poslala IKEA.'
    return
  }

  // 4. Provjera PIN-a ako je odabran paketomat
  if (contactState.isLocker && !contactState.lockerPin) {
    formError.value = 'Odabrali ste preuzimanje iz paketomata. Molimo unesite PIN za otvaranje.'
    return
  }

  isSubmitting.value = true

  // Simulacija API poziva (Ovdje kasnije ide tvoj pravi backend poziv)
  setTimeout(() => {
    isSubmitting.value = false
    formSuccess.value = `Hvala Vam, ${contactState.name.split(' ')[0]}! Vaš zahtjev za narudžbu #${contactState.ikeaOrderNumber} je uspješno zaprimljen. Uskoro ćemo vas kontaktirati.`

    // Resetiranje forme
    Object.assign(contactState, {
      name: '', phone: '', email: '', ikeaOrderNumber: '', ikeaPickupSlot: '',
      orderPdf: null, isLocker: false, lockerPin: '', street: '', city: '',
      zip: '42000', deliveryTerm: '', objectType: 'kuca', floor: '', notes: '', website: ''
    })

    // Opcionalno: Scrollaj na vrh forme da korisnik vidi poruku uspjeha
    window.scrollTo({ top: document.getElementById('contact-form')?.offsetTop, behavior: 'smooth' })
  }, 1500)
}
</script>

<template>
  <div id="contact-form" class="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

    <!-- Zaglavlje forme -->
    <div class="bg-gray-900 px-6 py-8 text-center sm:text-left sm:px-10">
      <h2 class="text-2xl font-black text-white">Podaci o dostavi</h2>
      <p class="text-gray-400 text-sm mt-2">Ispunite formu ispod i prepustite nam logistiku. Brzo, sigurno i usput.</p>
    </div>

    <div class="p-6 sm:p-10">

      <!-- Obavijesti (Uspjeh / Greška) -->
      <UAlert
        v-if="formError"
        icon="i-lucide-alert-circle"
        color="red"
        variant="soft"
        :title="formError"
        class="mb-8 font-medium"
      />

      <UAlert
        v-if="formSuccess"
        icon="i-lucide-check-circle-2"
        color="green"
        variant="soft"
        title="Zahtjev poslan!"
        :description="formSuccess"
        class="mb-8 font-medium"
      />

      <UForm :state="contactState" @submit="onContactSubmit" class="space-y-12">

        <!-- Honeypot -->
        <div class="absolute -left-[9999px] top-auto w-1 h-1 overflow-hidden" aria-hidden="true">
          <label for="website">Vaša web stranica (ostavite prazno)</label>
          <input id="website" v-model="contactState.website" type="text" name="website" tabindex="-1" autocomplete="off" />
        </div>

        <!-- 1. KORAK: Osobni podaci -->
        <section>
          <div class="flex items-center gap-3 mb-6">
            <div class="w-8 h-8 rounded-full bg-yellow-400 text-black flex items-center justify-center font-black shadow-sm">1</div>
            <h3 class="text-lg font-bold text-gray-900 uppercase tracking-wider">Vaši kontakt podaci</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
            <UFormGroup label="Ime i prezime" name="name" required class="md:col-span-2">
              <UInput v-model="contactState.name" icon="i-lucide-user" placeholder="Kako je navedeno na IKEA računu" size="lg" :ui="{ icon: { trailing: { pointer: '' } } }" />
            </UFormGroup>

            <UFormGroup label="Broj mobitela" name="phone" required>
              <UInput v-model="contactState.phone" type="tel" icon="i-lucide-smartphone" placeholder="091 234 5678" size="lg" />
            </UFormGroup>

            <UFormGroup label="E-mail adresa" name="email" required>
              <UInput v-model="contactState.email" type="email" icon="i-lucide-mail" placeholder="ivan@primjer.com" size="lg" />
            </UFormGroup>
          </div>
        </section>

        <!-- 2. KORAK: IKEA Podaci (Istaknuto plavom bojom) -->
        <section>
          <div class="flex items-center gap-3 mb-6">
            <div class="w-8 h-8 rounded-full bg-yellow-400 text-black flex items-center justify-center font-black shadow-sm">2</div>
            <h3 class="text-lg font-bold text-gray-900 uppercase tracking-wider">Podaci iz robne kuće</h3>
          </div>

          <div class="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-6 relative overflow-hidden">
            <div class="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>

            <UFormGroup label="Broj IKEA narudžbe" name="ikeaOrderNumber" required help="9-znamenkasti broj s potvrde">
              <UInput v-model="contactState.ikeaOrderNumber" icon="i-lucide-hash" placeholder="Npr. 123456789" size="lg" />
            </UFormGroup>

            <UFormGroup label="Termin prikupa" name="ikeaPickupSlot" required help="Kada je roba spremna u robnoj kući?">
              <UInput v-model="contactState.ikeaPickupSlot" icon="i-lucide-calendar-clock" placeholder="Npr. Utorak, 14:00 - 16:00" size="lg" />
            </UFormGroup>

            <UFormGroup
              label="PDF Potvrda narudžbe"
              name="orderPdf"
              required
              class="md:col-span-2 mt-2"
              help="Učitajte dokument koji vam je IKEA poslala na email. Služi nam kao dokaz za preuzimanje."
            >
              <div class="flex items-center justify-center w-full">
                <label for="pdf-upload" class="flex flex-col items-center justify-center w-full h-32 border-2 border-blue-200 border-dashed rounded-xl cursor-pointer bg-white hover:bg-blue-50 transition-colors">
                  <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    <UIcon name="i-lucide-upload-cloud" class="w-8 h-8 text-blue-500 mb-2" />
                    <p class="mb-1 text-sm text-gray-700 font-bold">
                      <span v-if="contactState.orderPdf" class="text-blue-600">{{ contactState.orderPdf.name }}</span>
                      <span v-else>Kliknite za učitavanje PDF dokumenta</span>
                    </p>
                    <p v-if="!contactState.orderPdf" class="text-xs text-gray-500">Maksimalna veličina: 5MB</p>
                  </div>
                  <input id="pdf-upload" type="file" accept="application/pdf" class="hidden" @change="handleFileChange" />
                </label>
              </div>
            </UFormGroup>

            <div class="md:col-span-2 pt-4 mt-2 border-t border-blue-100">
              <UCheckbox
                v-model="contactState.isLocker"
                name="isLocker"
                color="blue"
                class="font-bold text-gray-900"
              >
                <template #label>
                  <span>Moja narudžba se nalazi u <strong class="text-blue-700">IKEA Paketomatu</strong> (Locker)</span>
                </template>
              </UCheckbox>

              <div v-if="contactState.isLocker" class="mt-4 animate-pulse-once">
                <UFormGroup label="PIN za otvaranje paketomata" name="lockerPin" required>
                  <UInput v-model="contactState.lockerPin" icon="i-lucide-key" placeholder="Upišite kod iz SMS-a" size="lg" class="max-w-xs" />
                </UFormGroup>
              </div>
            </div>
          </div>
        </section>

        <!-- 3. KORAK: Adresa -->
        <section>
          <div class="flex items-center gap-3 mb-6">
            <div class="w-8 h-8 rounded-full bg-yellow-400 text-black flex items-center justify-center font-black shadow-sm">3</div>
            <h3 class="text-lg font-bold text-gray-900 uppercase tracking-wider">Adresa za istovar</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
            <UFormGroup label="Ulica i kućni broj" name="street" required class="md:col-span-12">
              <UInput v-model="contactState.street" icon="i-lucide-map-pin" placeholder="Zagrebačka ulica 1" size="lg" />
            </UFormGroup>

            <UFormGroup label="Grad / Naselje" name="city" required class="md:col-span-8">
              <UInput v-model="contactState.city" placeholder="Varaždin" size="lg" />
            </UFormGroup>

            <UFormGroup label="Poštanski broj" name="zip" required class="md:col-span-4">
              <UInput v-model="contactState.zip" placeholder="42000" size="lg" />
            </UFormGroup>

            <UFormGroup label="Vrsta objekta" name="objectType" class="md:col-span-6">
              <select
                v-model="contactState.objectType"
                class="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-yellow-500 text-sm bg-white shadow-sm cursor-pointer outline-none"
              >
                <option v-for="opt in objectOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </UFormGroup>

            <UFormGroup
              label="Kat"
              name="floor"
              class="md:col-span-6"
              :disabled="contactState.objectType === 'kuca'"
            >
              <UInput v-model="contactState.floor" :placeholder="contactState.objectType === 'kuca' ? 'Nije primjenjivo' : 'Npr. 2. kat, nema lifta'" size="lg" />
            </UFormGroup>
          </div>
        </section>

        <!-- 4. KORAK: Dodatno -->
        <section>
          <div class="flex items-center gap-3 mb-6">
            <div class="w-8 h-8 rounded-full bg-yellow-400 text-black flex items-center justify-center font-black shadow-sm">4</div>
            <h3 class="text-lg font-bold text-gray-900 uppercase tracking-wider">Napomene</h3>
          </div>

          <div class="grid grid-cols-1 gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
            <UFormGroup label="Željeni okvirni termin dostave na adresu" name="deliveryTerm" help="Pokušat ćemo se prilagoditi, ali točno vrijeme ovisi o ruti.">
              <UInput v-model="contactState.deliveryTerm" placeholder="Npr. Iza 16:30h" size="lg" icon="i-lucide-clock" />
            </UFormGroup>

            <UFormGroup label="Poruka za vozača" name="notes" help="Specifični detalji vezani uz prilaz kući, dvorište, interfon...">
              <UTextarea v-model="contactState.notes" placeholder="Npr. Zvono ne radi, nazovite kad ste ispred zgrade..." :rows="3" size="lg" autoresize />
            </UFormGroup>
          </div>
        </section>

        <!-- SUBMIT -->
        <div class="pt-4 border-t border-gray-200 mt-8">
          <UButton
            type="submit"
            size="xl"
            block
            icon="i-lucide-send"
            :loading="isSubmitting"
            style="background-color: #facc15; color: #000; font-weight: 900; font-size: 1.1rem; padding: 1rem;"
            class="hover:bg-yellow-500 transition-all shadow-xl hover:shadow-yellow-400/30 transform hover:-translate-y-0.5"
          >
            {{ isSubmitting ? 'Slanje zahtjeva u tijeku...' : 'Pošalji zahtjev za dostavu' }}
          </UButton>
          <p class="text-center text-xs text-gray-500 mt-4">
            Klikom na gumb potvrđujete da se slažete s našim <NuxtLink to="/terms-of-service" class="underline hover:text-gray-900">Uvjetima korištenja</NuxtLink>.
          </p>
        </div>

      </UForm>
    </div>
  </div>
</template>

<style scoped>
.animate-pulse-once {
  animation: pulse 2s ease-in-out 1;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.9; transform: scale(0.98); }
}
</style>
