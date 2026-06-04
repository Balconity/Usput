<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isSavingProfile = ref(false)
const isUpdatingPassword = ref(false)

// --- PODACI O PROFILU ---
const profile = ref({
  fullName: 'Ivan Horvat',
  email: 'ivan.horvat@email.com',
  phone: '+385 91 234 5678',
  defaultAddress: 'Zagrebačka ulica 1',
  defaultCity: 'Varaždin'
})

// --- FORMA ZA PROMJENU LOZINKE ---
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const cityOptions = [
  { label: 'Varaždin', value: 'Varaždin' },
  { label: 'Novi Marof', value: 'Novi Marof' },
  { label: 'Zagreb (Istok)', value: 'Zagreb (Istok)' }
]

// --- AKCIJA: SPREMANJE PROFILA ---
async function saveProfile() {
  isSavingProfile.value = true
  // Ovdje kasnije spajaš AWS Amplify: updateProfileAttributes()
  await new Promise(resolve => setTimeout(resolve, 1000))
  isSavingProfile.value = false
  alert('Podaci profila uspješno ažurirani!')
}

// --- AKCIJA: PROMJENA LOZINKE (Cognito) ---
async function updatePassword() {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    alert('Nove lozinke se ne podudaraju!')
    return
  }

  isUpdatingPassword.value = true
  try {
    // Ovdje u produkciji ide AWS Amplify: await updatePassword({ oldPassword, newPassword })
    await new Promise(resolve => setTimeout(resolve, 1200))
    alert('Lozinka uspješno promijenjena!')
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  } catch (error) {
    alert('Greška pri promjeni lozinke. Provjerite trenutnu lozinku.')
  } finally {
    isUpdatingPassword.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 font-sans text-neutral-900 pb-20">

    <header class="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm w-full">
      <div class="w-full max-w-[1200px] mx-auto flex items-center justify-between py-4 px-4 sm:px-6 lg:px-8">
        <UButton color="gray" variant="ghost" icon="i-lucide-arrow-left" @click="router.push('/profile')" class="font-bold">
          Natrag na profil
        </UButton>
        <span class="text-xl font-bold opacity-80">Usput<span class="text-yellow-500">.</span></span>
      </div>
    </header>

    <main class="pt-10 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-[900px] mx-auto">

        <h1 class="text-3xl font-black text-gray-950 mb-8">Postavke računa</h1>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-start w-full">

          <div class="md:col-span-7 space-y-6 w-full">
            <UCard class="shadow-sm border border-gray-200 rounded-2xl bg-white w-full">
              <div class="p-6">
                <h2 class="text-base font-bold text-gray-900 flex items-center gap-2 mb-6 border-b border-gray-100 pb-3">
                  <UIcon name="i-lucide-user" class="w-5 h-5 text-yellow-500" /> Osobni podaci
                </h2>

                <form @submit.prevent="saveProfile" class="space-y-4">
                  <div class="space-y-1.5">
                    <label class="text-xs font-bold text-gray-600 uppercase tracking-wider">Ime i prezime</label>
                    <UInput v-model="profile.fullName" size="lg" class="w-full" />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      Email adresa <UIcon name="i-lucide-lock" class="w-3 h-3 text-gray-400" />
                    </label>
                    <UInput v-model="profile.email" size="lg" disabled class="w-full bg-gray-50 text-gray-400" />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-bold text-gray-600 uppercase tracking-wider">Broj mobitela</label>
                    <UInput v-model="profile.phone" type="tel" size="lg" class="w-full" />
                  </div>

                  <h2 class="text-base font-bold text-gray-900 flex items-center gap-2 pt-6 mb-4 border-b border-gray-100 pb-3">
                    <UIcon name="i-lucide-map-pin" class="w-5 h-5 text-yellow-500" /> Defaultna adresa za dostavu
                  </h2>

                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="space-y-1.5 sm:col-span-2">
                      <label class="text-xs font-bold text-gray-600 uppercase tracking-wider">Ulica i kućni broj</label>
                      <UInput v-model="profile.defaultAddress" size="lg" class="w-full" />
                    </div>
                    <div class="space-y-1.5">
                      <label class="text-xs font-bold text-gray-600 uppercase tracking-wider">Grad</label>
                      <USelect v-model="profile.defaultCity" :options="cityOptions" size="lg" class="w-full" />
                    </div>
                  </div>

                  <div class="pt-4 text-right">
                    <UButton
                      type="submit"
                      size="md"
                      :loading="isSavingProfile"
                      style="background-color: #facc15; color: #000; font-weight: bold;"
                      class="hover:bg-yellow-500 px-6 rounded-xl"
                    >
                      Spremi izmjene
                    </UButton>
                  </div>
                </form>
              </div>
            </UCard>
          </div>

          <div class="md:col-span-5 w-full">
            <UCard class="shadow-sm border border-gray-200 rounded-2xl bg-white w-full">
              <div class="p-6">
                <h2 class="text-base font-bold text-gray-900 flex items-center gap-2 mb-6 border-b border-gray-100 pb-3">
                  <UIcon name="i-lucide-shield-check" class="w-5 h-5 text-yellow-500" /> Sigurnost (Lozinka)
                </h2>

                <form @submit.prevent="updatePassword" class="space-y-4 w-full">
                  <div class="space-y-1.5 w-full">
                    <label class="text-xs font-bold text-gray-600 uppercase tracking-wider">Trenutna lozinka</label>
                    <UInput v-model="passwordForm.currentPassword" type="password" size="md" class="w-full" />
                  </div>

                  <div class="space-y-1.5 w-full">
                    <label class="text-xs font-bold text-gray-600 uppercase tracking-wider">Nova lozinka</label>
                    <UInput v-model="passwordForm.newPassword" type="password" size="md" class="w-full" />
                  </div>

                  <div class="space-y-1.5 w-full">
                    <label class="text-xs font-bold text-gray-600 uppercase tracking-wider">Potvrdi novu lozinku</label>
                    <UInput v-model="passwordForm.confirmPassword" type="password" size="md" class="w-full" />
                  </div>

                  <div class="pt-4">
                    <UButton
                      type="submit"
                      size="md"
                      block
                      :loading="isUpdatingPassword"
                      color="black"
                      class="font-bold rounded-xl text-white bg-gray-900 hover:bg-black"
                    >
                      Promijeni lozinku
                    </UButton>
                  </div>
                </form>
              </div>
            </UCard>
          </div>

        </div>

      </div>
    </main>
  </div>
</template>
