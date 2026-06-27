<script setup lang="ts">
import { ref } from 'vue'

const colorMode = useColorMode()
colorMode.preference = 'light'

useHead({
  title: 'Često postavljana pitanja | Usput Dostava Varaždin',
  meta: [
    { name: 'description', content: 'Imate pitanja o IKEA dostavi iz Zagreba za Varaždin? Saznajte sve o plaćanju, paketomatima, unosu na kat i našem načinu rada.' },
    { property: 'og:title', content: 'Često postavljana pitanja | Usput Dostava' },
  ]
})

// --- FAQ PODACI ---
const faqs = ref([
  {
    question: 'Plaćam li vama i namještaj i dostavu?',
    answer: 'Ne. Namještaj plaćate direktno IKEA-i prilikom narudžbe na njihovom službenom webshopu. Nama plaćate isključivo uslugu preuzimanja, transporta iz Zagreba u Varaždin i unosa u vaš dom.',
    isOpen: true // Prvo pitanje ostavljamo otvoreno
  },
  {
    question: 'Kako točno funkcionira preuzimanje iz IKEA Paketomata?',
    answer: 'Vrlo jednostavno! Prilikom kupnje na IKEA webshopu, pod način isporuke odaberete "Preuzimanje u robnoj kući / Paketomat". Kada IKEA pripremi vašu narudžbu, poslat će vam SMS s PIN kodom za otključavanje pretinca. Taj PIN i broj pretinca samo proslijedite nama, a mi odlazimo u Zagreb, otključavamo paketomat, preuzimamo vašu robu i vozimo je vama.',
    isOpen: false
  },
  {
    question: 'Jeste li vi službena IKEA dostava?',
    answer: 'Ne, mi smo potpuno neovisni, lokalni obrt iz Varaždina (braća Kruno i Tomi). Nismo dio IKEA korporacije, već nudimo privatnu uslugu prijevoza kao bržu, lokalnu i fleksibilniju alternativu službenim logističkim partnerima.',
    isOpen: false
  },
  {
    question: 'Nosíte li namještaj na kat ako zgrada nema lift?',
    answer: 'Apsolutno! Ako ste odabrali opciju "Dostava u prostoriju", naš je posao da unesemo vaše pakete točno tamo gdje želite, bez obzira na to koji ste kat i postoji li u zgradi lift. Mi teglimo, vi se opustite.',
    isOpen: false
  },
  {
    question: 'Što ako neki artikl iz moje košarice trenutno nije dostupan u Zagrebu?',
    answer: 'Naš kalkulator na naslovnici čita vašu košaricu i računa prostor. Ako IKEA prilikom vaše naplate javi da nečega nema na stanju, možete to ukloniti iz košarice. Ako se time značajno smanji težina/volumen (npr. prelazite iz velikog u standardni paket), samo nam se javite prije polaska i prilagodit ćemo cijenu dostave naniže.',
    isOpen: false
  },
  {
    question: 'Radite li i montažu namještaja?',
    answer: 'Trenutno smo fokusirani isključivo na sigurnu i brzu dostavu. Uslugu montaže i sastavljanja namještaja zasad ne nudimo.',
    isOpen: false
  },
  {
    question: 'Što ako se paket ošteti u transportu?',
    answer: 'Pakete iz IKEA-e nosimo direktno u kombi i iz kombija u vaš dom, bez prekrcavanja po tuđim skladištima, čime je rizik od oštećenja minimalan. Ipak, ako se dogodi nezgoda našom krivnjom tijekom nošenja ili vožnje, preuzimamo punu odgovornost i štetu rješavamo u dogovoru s vama.',
    isOpen: false
  },
  {
    question: 'Vršite li uslugu povrata robe u IKEA-u?',
    answer: 'Da! Ako vam se neki proizvod ne sviđa ili vam ne odgovara, možemo dogovoriti povrat. Pripremite originalni račun i neoštećen artikl, a mi ćemo ga prilikom naše iduće vožnje za Zagreb vratiti u IKEA-u umjesto vas (ova usluga naplaćuje se prema dogovoru ovisno o veličini paketa).',
    isOpen: false
  }
])

function toggleFaq(index: number) {
  faqs.value.forEach((faq, i) => {
    if (i === index) {
      faq.isOpen = !faq.isOpen
    } else {
      faq.isOpen = false // Automatski zatvara ostale kartice radi preglednosti
    }
  })
}
</script>

<template>
  <div class="min-h-screen flex flex-col font-sans bg-gray-50 text-neutral-900 selection:bg-yellow-400 selection:text-black scroll-smooth">
    <AppHeader />

    <main class="flex-grow pt-16 pb-24 lg:pt-24 lg:pb-32 relative overflow-hidden">

      <div class="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-yellow-400/10 rounded-full blur-3xl pointer-events-none z-0"></div>

      <UContainer class="relative z-10">

        <div class="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h1 class="text-4xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
            Često postavljana <span class="text-yellow-400">pitanja</span>
          </h1>
          <p class="text-lg text-gray-600 font-medium leading-relaxed">
            Prikupili smo sve najvažnije informacije o tome kako radimo. Ako ne pronađete odgovor na svoje pitanje, slobodno nas kontaktirajte.
          </p>
        </div>

        <div class="max-w-3xl mx-auto space-y-4 animate-fade-in" style="animation-delay: 0.1s;">
          <div
            v-for="(faq, index) in faqs"
            :key="index"
            class="bg-white border rounded-2xl overflow-hidden transition-all duration-300"
            :class="faq.isOpen ? 'border-yellow-400 shadow-md ring-1 ring-yellow-400/50' : 'border-gray-200 hover:border-gray-300 shadow-sm'"
          >
            <button
              @click="toggleFaq(index)"
              class="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none focus-visible:bg-gray-50"
            >
              <span class="font-bold text-lg pr-4" :class="faq.isOpen ? 'text-gray-900' : 'text-gray-700'">
                {{ faq.question }}
              </span>
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300"
                :class="faq.isOpen ? 'bg-yellow-400 text-gray-900 rotate-180' : 'bg-gray-100 text-gray-500'"
              >
                <UIcon name="i-lucide-chevron-down" class="w-5 h-5" />
              </div>
            </button>

            <div
              class="grid transition-all duration-300 ease-in-out"
              :class="faq.isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'"
            >
              <div class="overflow-hidden">
                <div class="px-6 pb-6 pt-2 text-gray-600 font-medium leading-relaxed border-t border-gray-50">
                  {{ faq.answer }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="max-w-3xl mx-auto mt-20 animate-fade-in" style="animation-delay: 0.2s;">
          <div class="bg-gray-900 rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden shadow-xl border border-gray-800">
            <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-20"></div>

            <div class="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10 border border-gray-700">
              <UIcon name="i-lucide-message-circle-question" class="w-8 h-8 text-yellow-400" />
            </div>

            <h3 class="text-2xl font-black text-white mb-3 relative z-10">Niste pronašli ono što tražite?</h3>
            <p class="text-gray-400 mb-8 max-w-md mx-auto relative z-10">
              Uvijek smo dostupni za sva Vaša pitanja. Pošaljite nam poruku ili nas nazovite – rado ćemo Vam pomoći oko narudžbe.
            </p>

            <div class="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <a href="mailto:info@usput.hr" class="inline-flex items-center justify-center gap-2 bg-yellow-400 text-gray-900 font-black px-6 py-3 rounded-xl hover:bg-yellow-300 transition-colors w-full sm:w-auto">
                <UIcon name="i-lucide-mail" class="w-5 h-5" />
                Pošalji e-mail
              </a>
              <a href="tel:+385991234567" class="inline-flex items-center justify-center gap-2 bg-gray-800 text-white font-bold px-6 py-3 rounded-xl hover:bg-gray-700 border border-gray-700 transition-colors w-full sm:w-auto">
                <UIcon name="i-lucide-phone" class="w-5 h-5 text-gray-400" />
                Nazovi nas
              </a>
            </div>
          </div>
        </div>

      </UContainer>
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
