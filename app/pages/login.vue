<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signUp, confirmSignUp, signIn } from 'aws-amplify/auth'

const router = useRouter()

// Stanje prikaza: 'login' | 'register' | 'confirm'
const view = ref<'login' | 'register' | 'confirm'>('login')

// Podaci iz forme
const name = ref('')
const phoneNumber = ref('')
const email = ref('')
const password = ref('')
const confirmationCode = ref('')

// UX stanja
const isLoading = ref(false)
const errorMessage = ref('')

// Prebacivanje između login i register ekrana
function toggleView() {
  errorMessage.value = ''
  view.value = view.value === 'login' ? 'register' : 'login'
}

// 1. KORAK: Registracija
async function handleRegister() {
  if (!email.value || !password.value || !name.value || !phoneNumber.value) {
    errorMessage.value = 'Molimo unesite sve tražene podatke.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  // AWS Cognito zahtijeva + predbroj (E.164 format).
  // Automatski pretvaramo "091..." u "+38591..." ako korisnik zaboravi
  let formattedPhone = phoneNumber.value.trim()
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '+385' + formattedPhone.substring(1)
  } else if (!formattedPhone.startsWith('+')) {
    formattedPhone = '+' + formattedPhone
  }

  try {
    const { nextStep } = await signUp({
      username: email.value,
      password: password.value,
      options: {
        userAttributes: {
          email: email.value,
          name: name.value,
          phone_number: formattedPhone // Cognito standardno ime za telefon
        }
      }
    })

    if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
      view.value = 'confirm'
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'Greška pri registraciji.'
  } finally {
    isLoading.value = false
  }
}

// 2. KORAK: Potvrda koda s maila
async function handleConfirm() {
  if (!confirmationCode.value) {
    errorMessage.value = 'Molimo unesite kod.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const { isSignUpComplete } = await confirmSignUp({
      username: email.value,
      confirmationCode: confirmationCode.value
    })

    if (isSignUpComplete) {
      alert('Uspješno potvrđeno! Sada se možete prijaviti.')
      view.value = 'login'
      password.value = '' // Očisti lozinku radi sigurnosti
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'Neispravan kod.'
  } finally {
    isLoading.value = false
  }
}

// 3. KORAK: Prijava
async function handleLogin() {
  if (!email.value || !password.value) {
    errorMessage.value = 'Molimo unesite email i lozinku.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const { isSignedIn } = await signIn({
      username: email.value,
      password: password.value
    })

    if (isSignedIn) {
      // Uspješan login preusmjerava korisnika na početnu
      router.push('/')
    }
  } catch (error: any) {
    errorMessage.value = 'Pogrešan email ili lozinka.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 font-sans text-neutral-900 px-4 py-12">
    <div class="w-full max-w-md">

      <div class="text-center mb-8">
        <NuxtLink to="/" class="text-3xl font-extrabold inline-block">
          Usput<span class="text-yellow-500">.</span>
        </NuxtLink>
      </div>

      <UCard class="shadow-xl ring-1 ring-gray-200/50 rounded-2xl bg-white w-full overflow-hidden">

        <div class="p-2 sm:p-4">

          <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-3 shadow-sm">
            <UIcon name="i-lucide-alert-circle" class="w-5 h-5 shrink-0 mt-0.5" />
            <span class="font-medium">{{ errorMessage }}</span>
          </div>

          <div v-if="view === 'confirm'" class="space-y-6">
            <div class="text-center mb-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Provjerite email</h2>
              <p class="text-sm text-gray-500">Poslali smo 6-znamenkasti kod na <br/><b class="text-gray-800">{{ email }}</b></p>
            </div>

            <div class="w-full space-y-1.5">
              <label class="block text-sm font-bold text-gray-700">
                Verifikacijski kod <span class="text-red-500">*</span>
              </label>
              <UInput v-model="confirmationCode" placeholder="123456" size="xl" icon="i-lucide-shield-check" class="w-full" />
            </div>

            <UButton
              block
              size="xl"
              :loading="isLoading"
              style="background-color: #facc15; color: #000; font-weight: bold;"
              class="hover:bg-yellow-500 transition-colors mt-8 shadow-md w-full"
              @click="handleConfirm"
            >
              Potvrdi email
            </UButton>
          </div>

          <div v-else class="space-y-8">
            <div class="text-center">
              <h2 class="text-2xl font-bold text-gray-900 mb-2">
                {{ view === 'login' ? 'Dobrodošli natrag' : 'Kreirajte račun' }}
              </h2>
              <p class="text-sm text-gray-500">
                {{ view === 'login' ? 'Prijavite se za praćenje svojih pošiljki.' : 'Pridružite se platformi za pametniju dostavu.' }}
              </p>
            </div>

            <div class="space-y-6 w-full">

              <template v-if="view === 'register'">
                <div class="w-full space-y-1.5">
                  <label for="name" class="block text-sm font-bold text-gray-700">
                    Ime i prezime <span class="text-red-500">*</span>
                  </label>
                  <UInput id="name" v-model="name" placeholder="Ivan Horvat" size="xl" icon="i-lucide-user" class="w-full" />
                </div>

                <div class="w-full space-y-1.5">
                  <label for="phone" class="block text-sm font-bold text-gray-700">
                    Broj telefona <span class="text-red-500">*</span>
                  </label>
                  <UInput id="phone" v-model="phoneNumber" type="tel" placeholder="+385912345678" size="xl" icon="i-lucide-phone" class="w-full" />
                  <p class="text-xs text-gray-400 mt-1">Npr. +385 91 234 5678</p>
                </div>
              </template>

              <div class="w-full space-y-1.5">
                <label for="email" class="block text-sm font-bold text-gray-700">
                  Email adresa <span class="text-red-500">*</span>
                </label>
                <UInput id="email" v-model="email" type="email" placeholder="vas@email.com" size="xl" icon="i-lucide-mail" class="w-full" />
              </div>

              <div class="w-full space-y-1.5">
                <label for="password" class="block text-sm font-bold text-gray-700">
                  Lozinka <span class="text-red-500">*</span>
                </label>
                <UInput id="password" v-model="password" type="password" placeholder="••••••••" size="xl" icon="i-lucide-lock" class="w-full" />
                <p v-if="view === 'register'" class="text-xs text-gray-400 mt-1 leading-relaxed">
                  Lozinka mora imati barem 8 znakova, broj, te velika i mala slova.
                </p>
              </div>
            </div>

            <div class="pt-2">
              <UButton
                v-if="view === 'login'"
                block
                size="xl"
                :loading="isLoading"
                class="bg-gray-900 hover:bg-black text-white font-bold transition-colors w-full shadow-md"
                @click="handleLogin"
              >
                Prijavi se
              </UButton>

              <UButton
                v-else
                block
                size="xl"
                :loading="isLoading"
                style="background-color: #facc15; color: #000; font-weight: bold;"
                class="hover:bg-yellow-500 transition-colors w-full shadow-md"
                @click="handleRegister"
              >
                Registriraj se
              </UButton>
            </div>

          </div>
        </div>
      </UCard>

      <div v-if="view !== 'confirm'" class="text-center mt-8 text-sm text-gray-600">
        <span v-if="view === 'login'">
          Nemate račun?
          <button @click="toggleView" class="font-bold text-yellow-600 hover:text-yellow-700 underline transition-colors ml-1">Registrirajte se</button>
        </span>
        <span v-else>
          Već imate račun?
          <button @click="toggleView" class="font-bold text-gray-900 hover:text-black underline transition-colors ml-1">Prijavite se</button>
        </span>
      </div>

    </div>
  </div>
</template>
