<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

const appConfig = useAppConfig()
appConfig.ui.primary = 'yellow'
appConfig.ui.gray = 'neutral'

const trackingNumber = ref('')

function trackPackage() {
  if (!trackingNumber.value) return
  alert(`Tražim paket: ${trackingNumber.value}...`)
}

// Opcije za vrstu stambenog objekta
const objectOptions = [
  { label: 'Kuća', value: 'kuca' },
  { label: 'Zgrada', value: 'zgrada' }
]

const contactState = reactive({
  name: '',
  phone: '',
  email: '',
  orderPdf: null as File | null,
  isLocker: false, // Ovo će se automatski ili ručno aktivirati (ovisno o backend analizi PDF-a), za sada ostavljamo kao checkbox/toggle u formi radi UX-a ako sustav ne očita odmah
  lockerPin: '',
  street: '', // Ulica i kućni broj
  city: '',
  zip: '',
  deliveryTerm: '', // Željeni termin dostave
  objectType: 'kuca',
  floor: '', // Kat zgrade
  notes: '' // Napomena dostave
})

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    contactState.orderPdf = input.files[0]

    // OVDJE u budućnosti možeš okinuti backend API koji čita PDF
    // i ako u tekstu pronađe riječ "paketomat" ili "BoxNow", automatski prebaci:
    // contactState.isLocker = true
  }
}

function onContactSubmit() {
  // Osnovna provjera
  if (!contactState.name || !contactState.phone || !contactState.email || !contactState.street || !contactState.city || !contactState.zip) {
    alert('Molimo ispunite sva obavezna polja.')
    return
  }

  if (!contactState.orderPdf) {
    alert('Molimo učitajte PDF potvrde narudžbe.')
    return
  }

  alert(`Hvala vam, ${contactState.name}! Potvrda narudžbe (${contactState.orderPdf.name}) je zaprimljena. Naš sustav čita podatke o proizvodima i načinu isporuke te ćemo vas ubrzo kontaktirati!`)

  // Reset polja nakon slanja
  contactState.name = ''
  contactState.phone = ''
  contactState.email = ''
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
}
</script>

<template>
  <div class="min-h-screen flex flex-col font-sans bg-gray-50 text-neutral-900 selection:bg-yellow-400 selection:text-black">

    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <UContainer class="flex items-center justify-between py-4">
        <div class="flex items-center gap-2 text-xl font-bold">
          <span>Usput<span class="text-yellow-500">.</span></span>
        </div>

        <div class="flex items-center gap-4">
          <UButton color="warning" variant="solid" label="Naruči dostavu" icon="i-lucide-arrow-right" trailing to="#contact" />
        </div>
      </UContainer>
    </header>

    <main class="flex-grow">

      <section class="relative py-20 lg:py-32 overflow-hidden bg-gray-50">
        <UContainer>
          <div class="grid items-center">
            <div>
              <h1 class="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight">
                Pametnija dostava.<br/>
                Ne isplati se ako nije <span class="text-yellow-500">usput.</span>
              </h1>

              <p class="text-lg text-gray-600 max-w-xl mt-8">
                Dostavljamo vaše <strong style="color: #0057AD;">IKEA</strong> pakete na relaciji Zagreb &leftrightarrow; Varaždin.
                Zašto plaćati punu cijenu logistike? Naručite svoj paket, a mi vam ga donosimo jer ionako putujemo u tom smjeru.
              </p>
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

      <section id="process" class="py-20 bg-gray-50">
        <UContainer>
          <div class="text-center max-w-2xl mx-auto mb-16">
            <UBadge color="primary" variant="subtle" size="lg" class="mb-4">Kako radi?</UBadge>
            <h2 class="text-3xl font-bold mb-4">Proces dostave u 4 jednostavna koraka</h2>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            <div class="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>

            <div class="relative z-10 text-center bg-gray-50 p-4">
              <div class="w-16 h-16 mx-auto bg-yellow-400 text-black rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-lg ring-4 ring-white">1</div>
              <h4 class="font-bold text-lg mb-2">Ispunite formu</h4>
              <p class="text-sm text-gray-600">Ostavite svoje podatke, adresu dostave i po potrebi PIN od paketomata.</p>
            </div>

            <div class="relative z-10 text-center bg-gray-50 p-4">
              <div class="w-16 h-16 mx-auto bg-yellow-400 text-black rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-lg ring-4 ring-white">2</div>
              <h4 class="font-bold text-lg mb-2">Mi preuzimamo</h4>
              <p class="text-sm text-gray-600">Naš vozač preuzima vaš paket iz poslovnice, trgovine ili paketomata.</p>
            </div>

            <div class="relative z-10 text-center bg-gray-50 p-4">
              <div class="w-16 h-16 mx-auto bg-yellow-400 text-black rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-lg ring-4 ring-white">3</div>
              <h4 class="font-bold text-lg mb-2">Pratite vozača</h4>
              <p class="text-sm text-gray-600">Dobivate poveznicu za praćenje vozača na karti u stvarnom vremenu.</p>
            </div>

            <div class="relative z-10 text-center bg-gray-50 p-4">
              <div class="w-16 h-16 mx-auto bg-yellow-400 text-black rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-lg ring-4 ring-white">4</div>
              <h4 class="font-bold text-lg mb-2">Paket je na vratima</h4>
              <p class="text-sm text-gray-600">Sigurna i brza primopredaja točno na vašoj adresi. Bez stresa!</p>
            </div>
          </div>
        </UContainer>
      </section>

      <section id="route" class="py-20 bg-gray-50 border-t border-gray-200">
        <UContainer>
          <div class="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 class="text-3xl font-bold mb-4">Istaknuta ruta: <br/>Zagreb &leftrightarrow; Varaždin</h2>
              <p class="text-gray-600 mb-6">
                Vozimo svakodnevno autocestom A4. Budući da spajamo pošiljke između glavnog grada i sjevera Hrvatske, možemo ponuditi nevjerojatno konkurentne cijene i stroga jamstva isporuke istog dana.
              </p>

              <ul class="space-y-4">
                <li class="flex items-start gap-3">
                  <UIcon name="i-lucide-clock" class="w-6 h-6 text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 class="font-bold">Munjevito brzo</h4>
                    <p class="text-sm text-gray-600">Otprilike 1 sat vožnje nakon utovara.</p>
                  </div>
                </li>
                <li class="flex items-start gap-3">
                  <UIcon name="i-lucide-map-pin" class="w-6 h-6 text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 class="font-bold">Usluga od vrata do vrata</h4>
                    <p class="text-sm text-gray-600">Od IKEA-e Zagreb izravno do vašeg dnevnog boravka u Varaždinu.</p>
                  </div>
                </li>
                <li class="flex items-start gap-3">
                  <UIcon name="i-lucide-calendar-days" class="w-6 h-6 text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 class="font-bold">Fleksibilni rasporedi</h4>
                    <p class="text-sm text-gray-600">Jutarnji i popodnevni termini isporuke dostupni svaki dan.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div class="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm text-center">
              <div class="flex justify-between items-center relative">
                <div class="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0">
                  <div class="h-full bg-yellow-400 w-full animate-[pulse_2s_ease-in-out_infinite]"></div>
                </div>

                <div class="relative z-10 flex flex-col items-center gap-2 bg-white px-4">
                  <div class="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center border-2 border-yellow-500">
                    <UIcon name="i-lucide-building-2" class="w-6 h-6 text-neutral-700" />
                  </div>
                  <span class="font-bold">Zagreb</span>
                </div>

                <div class="relative z-10 bg-white px-2 text-yellow-500">
                  <UIcon name="i-lucide-truck" class="w-8 h-8" />
                </div>

                <div class="relative z-10 flex flex-col items-center gap-2 bg-white px-4">
                  <div class="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center border-2 border-yellow-500">
                    <UIcon name="i-lucide-castle" class="w-6 h-6 text-neutral-700" />
                  </div>
                  <span class="font-bold">Varaždin</span>
                </div>
              </div>
              <p class="mt-8 text-sm text-gray-500 font-medium tracking-wide uppercase">Udaljenost: ~85 km | Ruta: Autocesta A4</p>
            </div>
          </div>
        </UContainer>
      </section>

      <section id="driver" class="py-20 bg-white border-t border-gray-200">
        <UContainer>
          <div class="grid lg:grid-cols-2 gap-12 items-center">
            <div class="order-2 lg:order-1 relative flex justify-center">
              <div class="relative">
                <img
                  src="https://images.unsplash.com/photo-1622353155557-0130f1469e71?q=80&w=800&auto=format&fit=crop"
                  alt="Kruno the delivery man"
                  class="rounded-2xl shadow-xl w-full max-w-sm object-cover aspect-[4/5] border border-gray-200"
                />
                <div class="absolute -bottom-6 -right-6 lg:-right-10 bg-yellow-400 text-black p-4 rounded-xl shadow-lg border border-yellow-300">
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-star" class="w-6 h-6 fill-current" />
                    <span class="text-2xl font-black">5.0</span>
                  </div>
                  <div class="text-sm font-semibold mt-1">Ocjena kupaca</div>
                </div>
              </div>
            </div>

            <div class="order-1 lg:order-2 space-y-6">
              <UBadge color="primary" variant="subtle" size="lg">Upoznajte svog vozača</UBadge>

              <h2 class="text-4xl lg:text-5xl font-extrabold tracking-tight">
                Bok, ja sam Kruno.
              </h2>

              <p class="text-lg text-gray-600">
                Ja sam vaš posvećeni vozač za rutu Zagreb - Varaždin. S godinama iskustva za volanom i rukovanja osjetljivom robom, brinem se da vaši paketi, namještaj i materijali stignu sigurno i točno na vrijeme.
              </p>

              <ul class="space-y-4 pt-4">
                <li class="flex items-center gap-3">
                  <div class="bg-yellow-100 p-2 rounded-full text-yellow-600 shrink-0">
                    <UIcon name="i-lucide-package-check" class="w-5 h-5" />
                  </div>
                  <span class="font-medium text-gray-800">Preko 1000+ uspješnih dostava</span>
                </li>
                <li class="flex items-center gap-3">
                  <div class="bg-yellow-100 p-2 rounded-full text-yellow-600 shrink-0">
                    <UIcon name="i-lucide-sofa" class="w-5 h-5" />
                  </div>
                  <span class="font-medium text-gray-800">Stručnjak za teške terete i pažljivo rukovanje</span>
                </li>
                <li class="flex items-center gap-3">
                  <div class="bg-yellow-100 p-2 rounded-full text-yellow-600 shrink-0">
                    <UIcon name="i-lucide-smile" class="w-5 h-5" />
                  </div>
                  <span class="font-medium text-gray-800">Ljubazan, pouzdan i uvijek na vrijeme</span>
                </li>
              </ul>
            </div>
          </div>
        </UContainer>
      </section>

      <section id="pricing" class="py-20 bg-gray-50 border-t border-gray-200">
        <UContainer>
          <div class="text-center max-w-2xl mx-auto mb-16">
            <UBadge color="primary" variant="subtle" size="lg" class="mb-4">Cjenik</UBadge>
            <h2 class="text-3xl font-bold mb-4">Cijene po standardnim IKEA tarifama</h2>
            <p class="text-gray-600">Naša cijena dostave ovisi isključivo o težini i dimenzijama vaše narudžbe, jednako kao da naručujete direktno od njih.</p>
          </div>

          <UCard class="max-w-4xl mx-auto overflow-hidden p-0">
            <ul class="divide-y divide-gray-200">

              <li class="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div class="flex-grow">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-xl font-bold text-gray-900">Standardni paket</h3>
                  </div>
                  <p class="text-sm text-gray-500 mb-4">Idealno rješenje za manje narudžbe ukrasa, tekstila, sitnica i dodataka.</p>
                  <div class="flex flex-wrap gap-4 text-sm font-medium text-gray-700">
                    <span class="flex items-center gap-1.5"><UIcon name="i-lucide-scale" class="w-4 h-4 text-yellow-500" /> Do 14,99 kg</span>
                    <span class="flex items-center gap-1.5"><UIcon name="i-lucide-box" class="w-4 h-4 text-yellow-500" /> Max. 58 x 38 x 30 cm</span>
                  </div>
                </div>
                <div class="text-left md:text-right shrink-0 min-w-[120px]">
                  <div class="text-3xl font-extrabold">3,99 €</div>
                </div>
              </li>

              <li class="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between hover:bg-gray-50/50 transition-colors bg-yellow-50/30">
                <div class="flex-grow">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-xl font-bold text-gray-900">Veliki paket</h3>
                    <UBadge color="primary" variant="solid" size="xs">Najčešće</UBadge>
                  </div>
                  <p class="text-sm text-gray-500 mb-4">Najpopularnija opcija za srednje pakete i komade namještaja (stolice, police).</p>
                  <div class="flex flex-wrap gap-4 text-sm font-medium text-gray-700">
                    <span class="flex items-center gap-1.5"><UIcon name="i-lucide-scale" class="w-4 h-4 text-yellow-500" /> Do 29,99 kg</span>
                    <span class="flex items-center gap-1.5"><UIcon name="i-lucide-box" class="w-4 h-4 text-yellow-500" /> Max. 80 x 60 x 50 cm</span>
                  </div>
                </div>
                <div class="text-left md:text-right shrink-0 min-w-[120px]">
                  <div class="text-3xl font-extrabold">6,99 €</div>
                </div>
              </li>

              <li class="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div class="flex-grow">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-xl font-bold text-gray-900">Dostava do kolnog prilaza</h3>
                  </div>
                  <p class="text-sm text-gray-500 mb-4">Za narudžbe teškog namještaja. Isporuka do najbližeg prilaza zgradi / kući.</p>
                  <div class="flex flex-wrap gap-4 text-sm font-medium text-gray-700">
                    <span class="flex items-center gap-1.5"><UIcon name="i-lucide-scale" class="w-4 h-4 text-yellow-500" /> Do 100 kg</span>
                    <span class="flex items-center gap-1.5"><UIcon name="i-lucide-truck" class="w-4 h-4 text-yellow-500" /> Bez ograničenja volumena</span>
                  </div>
                </div>
                <div class="text-left md:text-right shrink-0 min-w-[120px]">
                  <div class="text-sm text-gray-500 font-medium mb-1">od</div>
                  <div class="text-3xl font-extrabold mt-[-5px]">44,99 €</div>
                </div>
              </li>

              <li class="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div class="flex-grow">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-xl font-bold text-gray-900">Dostava u prostoriju</h3>
                  </div>
                  <p class="text-sm text-gray-500 mb-4">VIP usluga unosa namještaja. (Napomena: za IKEA Family članove cijena kreće od 89,99 €).</p>
                  <div class="flex flex-wrap gap-4 text-sm font-medium text-gray-700">
                    <span class="flex items-center gap-1.5"><UIcon name="i-lucide-scale" class="w-4 h-4 text-yellow-500" /> Iznad 100 kg</span>
                    <span class="flex items-center gap-1.5"><UIcon name="i-lucide-sofa" class="w-4 h-4 text-yellow-500" /> Kompletan namještaj</span>
                  </div>
                </div>
                <div class="text-left md:text-right shrink-0 min-w-[120px]">
                  <div class="text-sm text-gray-500 font-medium mb-1">od</div>
                  <div class="text-3xl font-extrabold mt-[-5px]">119,99 €</div>
                </div>
              </li>

            </ul>

            <div class="p-6 bg-gray-100 border-t border-gray-200 flex justify-center">
              <UButton size="xl" color="primary" variant="solid" icon="i-lucide-arrow-right" trailing to="#contact">
                Zatraži dostavu odmah
              </UButton>
            </div>
          </UCard>
        </UContainer>
      </section>

      <section id="reviews" class="py-20 bg-white border-t border-gray-200">
        <UContainer>
          <div class="text-center max-w-2xl mx-auto mb-16">
            <h2 class="text-3xl font-bold mb-4">Što kažu naši klijenti</h2>
            <p class="text-gray-600">Ponosni smo na našu brzu uslugu i stotine zadovoljnih korisnika.</p>
          </div>

          <div class="grid md:grid-cols-3 gap-8">
            <UCard class="flex flex-col h-full bg-gray-50">
              <div class="flex gap-1 text-yellow-500 mb-4">
                <UIcon name="i-lucide-star" class="w-5 h-5 fill-current" v-for="n in 5" :key="n"/>
              </div>
              <p class="text-gray-600 italic mb-6 flex-grow">
                "Kruno je zakon! Naručila sam ormar iz IKEA-e i trebao mi je hitno prijevoz do Varaždina. Sve je stiglo bez ijedne ogrebotine, a putem mobitela sam vidjela točno kad stiže."
              </p>
              <div class="font-bold text-gray-900">— Ana M., Varaždin</div>
            </UCard>

            <UCard class="flex flex-col h-full bg-gray-50">
              <div class="flex gap-1 text-yellow-500 mb-4">
                <UIcon name="i-lucide-star" class="w-5 h-5 fill-current" v-for="n in 5" :key="n"/>
              </div>
              <p class="text-gray-600 italic mb-6 flex-grow">
                "Nisam stigao podići paket iz BoxNow paketomata jer sam radio produženo. Ispunio sam formu, poslao im PIN i paket me čekao doma pred vratima kad sam se vratio s posla."
              </p>
              <div class="font-bold text-gray-900">— Marko T., Zagreb</div>
            </UCard>

            <UCard class="flex flex-col h-full bg-gray-50">
              <div class="flex gap-1 text-yellow-500 mb-4">
                <UIcon name="i-lucide-star" class="w-5 h-5 fill-current" v-for="n in 5" :key="n"/>
              </div>
              <p class="text-gray-600 italic mb-6 flex-grow">
                "Najbolja i najpovoljnija opcija za prijevoz robe između ZG i VŽ. Komunikacija je odlična, jako su profesionalni i točni."
              </p>
              <div class="font-bold text-gray-900">— Ivana K., Novi Marof</div>
            </UCard>
          </div>
        </UContainer>
      </section>

      <section id="contact" class="py-20 bg-gray-50 border-t border-gray-200">
        <UContainer class="max-w-3xl">
          <div class="text-center mb-10">
            <h2 class="text-3xl font-bold mb-4">Naruči dostavu</h2>
            <p class="text-gray-600">Priložite IKEA potvrdu narudžbe u PDF formatu, a mi ćemo izvući popis proizvoda i detalje prikupa.</p>
          </div>

          <UCard class="shadow-lg">
            <UForm :state="contactState" @submit="onContactSubmit" class="space-y-8 p-2">

              <div>
                <h3 class="text-lg font-bold mb-4 text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
                  <span class="flex items-center justify-center bg-yellow-400 text-black text-xs font-black rounded-full w-5 h-5">1</span>
                  Naručitelj i dokumenti
                </h3>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <UFormGroup label="Ime i prezime naručitelja" name="name" required class="sm:col-span-2">
                    <UInput v-model="contactState.name" icon="i-lucide-user" placeholder="Ivan Horvat" size="lg" />
                  </UFormGroup>

                  <UFormGroup label="Broj telefona" name="phone" required>
                    <UInput v-model="contactState.phone" type="tel" icon="i-lucide-phone" placeholder="09x xxx xxxx" size="lg" />
                  </UFormGroup>

                  <UFormGroup label="E-mail adresa" name="email" required>
                    <UInput v-model="contactState.email" type="email" icon="i-lucide-mail" placeholder="ivan@primjer.com" size="lg" />
                  </UFormGroup>

                  <UFormGroup
                    label="PDF Potvrde narudžbe"
                    name="orderPdf"
                    required
                    class="sm:col-span-2"
                    help="Iz ovog dokumenta automatski vadimo proizvode, način isporuke i termin preuzimanja."
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

                  <UFormGroup label="Željeni termin dostave" name="deliveryTerm" class="sm:col-span-1">
                    <UInput v-model="contactState.deliveryTerm" placeholder="npr. Popodne iza 17h" size="lg" icon="i-lucide-clock" />
                  </UFormGroup>
                </div>
              </div>

              <div>
                <h3 class="text-lg font-bold mb-4 text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
                  <span class="flex items-center justify-center bg-yellow-400 text-black text-xs font-black rounded-full w-5 h-5">3</span>
                  Dodatne napomene
                </h3>

                <div class="space-y-5">
                  <UFormGroup label="Napomena za dostavljača" name="notes" help="Npr. uska ulica, ne radi zvono, ostaviti kod susjeda ako me nema...">
                    <UTextarea v-model="contactState.notes" placeholder="Upišite specifične detalje vezane uz prilaz ili dostavu..." size="lg" autoresize />
                  </UFormGroup>
                </div>
              </div>

              <div class="pt-4">
                <UButton type="submit" size="xl" block icon="i-lucide-send" style="background-color: #facc15; color: #000; font-weight: bold;" class="hover:bg-yellow-500 transition-colors">
                  Pošaljite zahtjev za dostavu
                </UButton>
              </div>

            </UForm>
          </UCard>
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
