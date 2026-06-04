<script setup lang="ts">
import { reactive } from 'vue'

const objectOptions = [
  { label: 'Kuća', value: 'kuca' },
  { label: 'Zgrada', value: 'zgrada' }
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
  zip: '',
  deliveryTerm: '',
  objectType: 'kuca',
  floor: '',
  notes: '',
  wantsAssembly: false,
  website: '' // OVO JE NAŠ HONEYPOT ZA BOTOVE
})

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    contactState.orderPdf = input.files[0]
  }
}

function onContactSubmit() {
  // HONEYPOT PROVJERA: Ako je skriveno polje ispunjeno, to je sigurno bot
  if (contactState.website !== '') {
    console.warn('Bot detektiran u formi za narudžbu! Odbacujem zahtjev.')
    return
  }

  // Provjera obaveznih polja
  if (!contactState.name || !contactState.phone || !contactState.email || !contactState.ikeaOrderNumber || !contactState.ikeaPickupSlot || !contactState.street || !contactState.city || !contactState.zip) {
    alert('Molimo ispunite sva obavezna polja.')
    return
  }

  if (!contactState.orderPdf) {
    alert('Molimo učitajte PDF potvrde narudžbe.')
    return
  }

  const assemblyMsg = contactState.wantsAssembly ? ' Zabilježili smo i vaš zahtjev za montažom namještaja te će vam se naš partner majstor ubrzo javiti.' : ''
  alert(`Hvala vam, ${contactState.name}! Vaša narudžba #${contactState.ikeaOrderNumber} je zaprimljena.${assemblyMsg} Naš sustav obrađuje podatke i kontaktirat ćemo vas ubrzo!`)

  // Reset forme nakon uspješnog slanja
  contactState.name = ''
  contactState.phone = ''
  contactState.email = ''
  contactState.ikeaOrderNumber = ''
  contactState.ikeaPickupSlot = ''
  contactState.orderPdf = null
  contactState.isLocker = false
  contactState.lockerPin = ''
  contactState.street = ''
  contactState.city = ''
  contactState.zip = ''
  contactState.deliveryTerm = ''
  contactState.objectType = 'kuca'
  contactState.floor = ''
  contactState.notes = ''
  contactState.wantsAssembly = false
  contactState.website = ''
}
</script>

<template>
  <UCard class="shadow-lg relative overflow-hidden">
    <UForm :state="contactState" @submit="onContactSubmit" class="space-y-8 p-2">

      <div class="absolute -left-[9999px] top-auto w-1 h-1 overflow-hidden" aria-hidden="true">
        <label for="website">Vaša web stranica (ostavite prazno)</label>
        <input id="website" v-model="contactState.website" type="text" name="website" tabindex="-1" autocomplete="off" />
      </div>

      <div>
        <h3 class="text-lg font-bold mb-4 text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
          <span class="flex items-center justify-center bg-yellow-400 text-black text-xs font-black rounded-full w-5 h-5">1</span>
          Naručitelj i podaci za preuzimanje
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <UFormGroup label="Ime i prezime naručitelja" name="name" required class="sm:col-span-2">
            <UInput v-model="contactState.name" icon="i-lucide-user" placeholder="Vaše ime, kako je navedeno na IKEA računu" size="lg" />
          </UFormGroup>

          <UFormGroup label="Broj telefona" name="phone" required>
            <UInput v-model="contactState.phone" type="tel" icon="i-lucide-phone" placeholder="09x xxx xxxx" size="lg" />
          </UFormGroup>

          <UFormGroup label="E-mail adresa" name="email" required>
            <UInput v-model="contactState.email" type="email" icon="i-lucide-mail" placeholder="ivan@primjer.com" size="lg" />
          </UFormGroup>

          <div class="sm:col-span-2 grid sm:grid-cols-2 gap-5 bg-blue-50 p-4 rounded-xl border border-blue-100 mt-2">
            <UFormGroup label="Broj IKEA narudžbe" name="ikeaOrderNumber" required help="Pronađite 9-znamenkasti broj na računu">
              <UInput v-model="contactState.ikeaOrderNumber" icon="i-lucide-hash" placeholder="Npr. 123456789" size="lg" />
            </UFormGroup>

            <UFormGroup label="IKEA termin prikupa" name="ikeaPickupSlot" required help="Kada je roba spremna u robnoj kući?">
              <UInput v-model="contactState.ikeaPickupSlot" icon="i-lucide-calendar-clock" placeholder="Npr. Utorak, 14:00 - 16:00" size="lg" />
            </UFormGroup>
          </div>

          <UFormGroup
            label="PDF Potvrde narudžbe"
            name="orderPdf"
            required
            class="sm:col-span-2"
            help="Učitajte službeni PDF koji vam je IKEA poslala na email kao dokaz o kupnji."
          >
            <UInput
              type="file"
              accept="application/pdf"
              icon="i-lucide-file-text"
              size="lg"
              @change="handleFileChange"
            />
          </UFormGroup>

          <div class="sm:col-span-2 bg-neutral-100 p-4 rounded-xl border border-gray-200 space-y-4">
            <UCheckbox
              v-model="contactState.isLocker"
              label="Je li odabrana isporuka u IKEA paketomat (Locker)?"
              name="isLocker"
            />

            <UFormGroup
              v-if="contactState.isLocker"
              label="Unesite PIN za otvaranje paketomata"
              name="lockerPin"
              required
            >
              <UInput v-model="contactState.lockerPin" icon="i-lucide-key" placeholder="123456" size="lg" class="max-w-xs" />
            </UFormGroup>
          </div>
        </div>
      </div>

      <div>
        <h3 class="text-lg font-bold mb-4 text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
          <span class="flex items-center justify-center bg-yellow-400 text-black text-xs font-black rounded-full w-5 h-5">2</span>
          Adresa dostave
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <UFormGroup label="Ulica i kućni broj" name="street" required class="sm:col-span-3">
            <UInput v-model="contactState.street" icon="i-lucide-map-pin" placeholder="Zagrebačka ulica 1" size="lg" />
          </UFormGroup>

          <UFormGroup label="Grad / Naselje" name="city" required class="sm:col-span-2">
            <UInput v-model="contactState.city" placeholder="Varaždin" size="lg" />
          </UFormGroup>

          <UFormGroup label="Poštanski broj (ZIP)" name="zip" required>
            <UInput v-model="contactState.zip" placeholder="42000" size="lg" />
          </UFormGroup>

          <UFormGroup label="Vrsta objekta" name="objectType">
            <USelect v-model="contactState.objectType" :options="objectOptions" size="lg" />
          </UFormGroup>

          <UFormGroup
            label="Kat zgrade"
            name="floor"
            :disabled="contactState.objectType === 'kuca'"
            :help="contactState.objectType === 'kuca' ? 'Nije primjenjivo za kuću' : 'Npr. 2. kat / potkrovlje'"
          >
            <UInput v-model="contactState.floor" placeholder="npr. 3. kat" size="lg" />
          </UFormGroup>

          <UFormGroup label="Vaš željeni termin dostave na adresu" name="deliveryTerm" class="sm:col-span-1" help="(Ovisno o ruti vozača)">
            <UInput v-model="contactState.deliveryTerm" placeholder="npr. Iza 17h" size="lg" icon="i-lucide-clock" />
          </UFormGroup>
        </div>
      </div>

      <div>
        <h3 class="text-lg font-bold mb-4 text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
          <span class="flex items-center justify-center bg-yellow-400 text-black text-xs font-black rounded-full w-5 h-5">3</span>
          Dodatne napomene i Usluge
        </h3>

        <div class="space-y-5">
          <UFormGroup label="Napomena za dostavljača" name="notes" help="Npr. uska ulica, ne radi zvono, ostaviti kod susjeda ako me nema...">
            <UTextarea v-model="contactState.notes" placeholder="Upišite specifične detalje vezane uz prilaz ili dostavu..." size="lg" autoresize />
          </UFormGroup>

          <div class="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
            <UCheckbox
              v-model="contactState.wantsAssembly"
              label="Želim informativnu ponudu za montažu namještaja"
              help="Naš partner majstor kontaktirat će vas s cijenom na temelju vaše narudžbe."
              name="wantsAssembly"
              color="yellow"
              class="font-bold text-gray-900"
            />
          </div>
        </div>
      </div>

      <div class="pt-4">
        <UButton type="submit" size="xl" block icon="i-lucide-send" style="background-color: #facc15; color: #000; font-weight: bold;" class="hover:bg-yellow-500 transition-colors shadow-lg">
          Pošaljite zahtjev za dostavu
        </UButton>
      </div>

    </UForm>
  </UCard>
</template>
