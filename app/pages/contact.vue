<script setup lang="ts">
import { ref, reactive } from 'vue'

const colorMode = useColorMode()
colorMode.preference = 'light'

useHead({
  title: 'Kontakt | Usput Dostava Varaždin',
  meta: [
    { name: 'description', content: 'Imate pitanje o dostavi iz IKEA-e? Želite dogovoriti povrat robe? Kontaktirajte Krunu i Tomija, tu smo za vas!' },
    { property: 'og:title', content: 'Kontakt | Usput Dostava' },
  ]
})

// --- FORMA ZA KONTAKT ---
const formState = reactive({
  name: '',
  email: '',
  phone: '',
  subject: 'Upit o dostavi',
  message: ''
})

const isSubmitting = ref(false)
const submitStatus = ref<'idle' | 'success' | 'error'>('idle')
const errorMessage = ref('')

async function submitContactForm() {
  // Osnovna validacija - Dodan telefon kao obavezno polje
  if (!formState.name || !formState.email || !formState.phone || !formState.message) {
    submitStatus.value = 'error'
    errorMessage.value = 'Molimo ispunite sva obavezna polja.'
    return
  }

  isSubmitting.value = true
  submitStatus.value = 'idle'
  errorMessage.value = ''

  try {
    // PRAVI API POZIV PREMA BACKENDU (server/api/contact.post.ts)
    const response: any = await $fetch('/api/contact', {
      method: 'POST',
      body: formState
    })

    if (response && response.success) {
      submitStatus.value = 'success'
      // Očisti formu nakon uspješnog slanja
      formState.name = ''
      formState.email = ''
      formState.phone = ''
      formState.subject = 'Upit o dostavi'
      formState.message = ''
    } else {
      throw new Error('Neočekivan odgovor servera.')
    }
  } catch (error) {
    console.error('Greška pri slanju forme:', error)
    submitStatus.value = 'error'
    errorMessage.value = 'Došlo je do greške prilikom slanja poruke. Molimo pokušajte ponovno ili nas nazovite.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col font-sans bg-gray-50 text-neutral-900 selection:bg-yellow-400 selection:text-black scroll-smooth">
    <AppHeader />

    <main class="flex-grow pt-16 pb-24 lg:pt-24 lg:pb-32 relative overflow-hidden">

      <div class="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-yellow-400/10 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div class="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-400/5 rounded-full blur-3xl pointer-events-none z-0"></div>

      <UContainer class="relative z-10">

        <div class="text-center max-w-3xl mx-auto mb-12 animate-fade-in">
          <h1 class="text-4xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
            Tu smo <span class="text-yellow-500">za Vas.</span>
          </h1>
          <p class="text-lg text-gray-600 font-medium leading-relaxed">
            Imate specifičan upit, trebate dogovoriti povrat robe ili jednostavno želite provjeriti detalje prije narudžbe? Javite se!
          </p>
        </div>

        <div class="max-w-3xl mx-auto grid sm:grid-cols-2 gap-4 mb-8 animate-fade-in" style="animation-delay: 0.1s;">

          <a href="tel:+385995977897" class="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-md group hover:bg-gray-800 transition-colors flex items-center gap-4 text-left">
            <div class="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center shrink-0 border border-gray-700 group-hover:bg-yellow-400 group-hover:border-yellow-400 transition-colors">
              <UIcon name="i-lucide-phone" class="w-5 h-5 text-yellow-400 group-hover:text-gray-900 transition-colors" />
            </div>
            <div>
              <p class="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Nazovite nas</p>
              <p class="text-lg font-black text-white group-hover:text-yellow-400 transition-colors">099 597 7897</p>
            </div>
          </a>

          <a href="mailto:info@usput.hr" class="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm group hover:border-blue-300 transition-colors flex items-center gap-4 text-left">
            <div class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-blue-500 group-hover:border-blue-500 transition-colors">
              <UIcon name="i-lucide-mail" class="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <div>
              <p class="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Pošaljite e-mail</p>
              <p class="text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors">info@usput.hr</p>
            </div>
          </a>

        </div>

        <div class="max-w-3xl mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-gray-200 shadow-sm animate-fade-in" style="animation-delay: 0.2s;">
          <div class="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
            <div>
              <h3 class="text-xl font-black text-gray-900">Pošaljite nam poruku</h3>
              <p class="text-sm text-gray-500 font-medium mt-0.5">Odgovaramo u najkraćem mogućem roku.</p>
            </div>
          </div>

          <form @submit.prevent="submitContactForm" class="space-y-6">

            <div class="grid sm:grid-cols-2 gap-6">
              <UFormField label="Ime i prezime *">
                <UInput v-model="formState.name" placeholder="Vaše ime" size="lg" icon="i-lucide-user" class="w-full bg-gray-50" />
              </UFormField>

              <UFormField label="E-mail adresa *">
                <UInput v-model="formState.email" type="email" placeholder="vaš@email.com" size="lg" icon="i-lucide-mail" class="w-full bg-gray-50" />
              </UFormField>
            </div>

            <div class="grid sm:grid-cols-2 gap-6">
              <UFormField label="Broj telefona *">
                <UInput v-model="formState.phone" type="tel" placeholder="09x xxx xxxx" size="lg" icon="i-lucide-phone" class="w-full bg-gray-50" />
              </UFormField>

              <UFormField label="Tema upita">
                <select v-model="formState.subject" class="block w-full py-2.5 px-3 sm:text-sm border-gray-300 rounded-lg bg-gray-50 border text-gray-900 shadow-sm focus:ring-yellow-500 focus:border-yellow-500 font-medium">
                  <option value="Upit o dostavi">Opći upit o dostavi</option>
                  <option value="Postojeća narudžba">Pitanje o postojećoj narudžbi</option>
                  <option value="Povrat robe">Povrat robe u IKEA-u</option>
                  <option value="Poslovna suradnja">Poslovna suradnja (B2B)</option>
                  <option value="Nešto drugo">Nešto drugo</option>
                </select>
              </UFormField>
            </div>

            <UFormField label="Vaša poruka *">
              <UTextarea v-model="formState.message" :rows="5" placeholder="Kako vam možemo pomoći?" size="lg" class="w-full bg-gray-50" />
            </UFormField>

            <div v-if="submitStatus === 'error'" class="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <UIcon name="i-lucide-alert-circle" class="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p class="text-sm font-bold text-red-800">{{ errorMessage }}</p>
            </div>

            <div v-if="submitStatus === 'success'" class="p-5 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 animate-fade-in">
              <UIcon name="i-lucide-check-circle-2" class="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p class="text-base font-black text-green-900">Poruka je uspješno poslana!</p>
                <p class="text-sm text-green-700 mt-1 font-medium">Hvala na javljanju. Pročitat ćemo vaš upit i javiti se u najkraćem roku.</p>
              </div>
            </div>

            <div class="pt-4 flex justify-center">
              <UButton
                type="submit"
                class="shadow-xl font-black transition-transform hover:-translate-y-0.5 px-10 py-3 p-3"
                style="background-color: #facc15; color: #000;"
                size="xl"
                :loading="isSubmitting"
                :disabled="submitStatus === 'success'"
                trailing-icon="i-lucide-send"
              >
                {{ submitStatus === 'success' ? 'Poslano' : 'Pošalji poruku' }}
              </UButton>
            </div>

          </form>
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
