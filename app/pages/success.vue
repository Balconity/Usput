<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// U realnoj aplikaciji ovdje povlačiš stvarni ID narudžbe iz URL-a (npr. /success?id=1717265230)
const orderId = ref((route.query.id as string) || '1717265230')

// Automatsko preusmjeravanje ako netko zaluta na ovu stranicu bez ID-a
onMounted(() => {
  // Ovdje možeš pokrenuti konfete (npr. canvas-confetti) ako želiš dodatni "wow" efekt!
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans text-neutral-900 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-xl text-center">

      <UCard class="shadow-xl border border-gray-200/60 rounded-3xl bg-white p-6 sm:p-10 overflow-hidden relative">
        <div class="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500"></div>

        <div class="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100 shadow-inner animate-[bounce_1s_ease-in-out]">
          <UIcon name="i-lucide-check-circle-2" class="w-12 h-12 fill-current opacity-20 absolute" />
          <UIcon name="i-lucide-check" class="w-10 h-10 relative stroke-[3]" />
        </div>

        <h1 class="text-3xl font-black text-gray-950 mb-2 tracking-tight">Dostava je rezervirana!</h1>
        <p class="text-gray-600 font-medium px-4">Hvala vam na povjerenju. Vaš zahtjev je uspješno zaprimljen u naš logistički sustav.</p>

        <div class="bg-gray-50 border border-gray-100 rounded-2xl p-5 my-8 text-left space-y-3">
          <div class="flex justify-between items-center text-sm border-b border-gray-200/60 pb-3">
            <span class="text-gray-500 font-bold uppercase tracking-wider text-[11px]">Broj dostave:</span>
            <span class="font-mono font-black text-gray-900">DELIVERY#{{ orderId }}</span>
          </div>
          <div class="flex justify-between items-center text-sm pt-1">
            <span class="text-gray-500 font-medium">Status:</span>
            <UBadge color="amber" variant="subtle" class="font-black text-[10px] uppercase tracking-wider px-2 py-0.5">Zaprimljeno</UBadge>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-500 font-medium">Usluga unosa:</span>
            <span class="font-bold text-green-600">Uključena (do vrata)</span>
          </div>
        </div>

        <div class="text-left space-y-4 mb-10 pl-2">
          <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Što se događa sljedeće?</h3>

          <div class="flex gap-4 items-start">
            <div class="w-6 h-6 bg-yellow-400 text-black rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-sm">1</div>
            <div>
              <h4 class="font-bold text-gray-950 text-sm">Prikup u IKEA robnoj kući</h4>
              <p class="text-xs text-gray-500 mt-0.5">Naš vozač Kruno odlazi preuzeti vaše pakete sukladno izračunatom volumenu.</p>
            </div>
          </div>

          <div class="flex gap-4 items-start">
            <div class="w-6 h-6 bg-yellow-400 text-black rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-sm">2</div>
            <div>
              <h4 class="font-bold text-gray-950 text-sm">SMS obavijest i praćenje</h4>
              <p class="text-xs text-gray-500 mt-0.5">Čim kombi krene prema vama, dobit ćete SMS s linkom za praćenje vozača uživo.</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <UButton
            block
            size="lg"
            style="background-color: #facc15; color: #000; font-weight: 900;"
            class="hover:bg-yellow-500 shadow-md h-12 rounded-xl transition-transform active:scale-95"
            :to="`/tracking/${orderId}`"
          >
            Prati dostavu uživo
          </UButton>

          <UButton
            block
            size="lg"
            color="gray"
            variant="solid"
            class="font-bold h-12 rounded-xl transition-transform active:scale-95 bg-gray-100 hover:bg-gray-200 text-gray-800"
            to="/profile"
          >
            Pogledaj sve dostave
          </UButton>
        </div>

      </UCard>
    </div>
  </div>
</template>
