<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const deliveryId = route.params.id

// Mock data including S3 images and logs
const delivery = ref({
  id: deliveryId,
  customer: { name: 'Ivan Horvat', phone: '+385 91 234 5678', email: 'ivan@horvat.hr' },
  address: 'Zagrebačka 1, Varaždin, 2nd Floor',
  metrics: { volume: 0.85, weight: 45.2, items: 4 },
  financials: { price: 44.99, status: 'PAID', stripeId: 'ch_3Nabc123' },
  proofOfDelivery: 'http://googleusercontent.com/image_collection/image_retrieval/16586229707638013338', // Mock S3 link
  logs: [
    { time: '12.06. 14:00', event: 'Order Created', user: 'System' },
    { time: '12.06. 15:30', event: 'Picked up at IKEA', user: 'Driver: Kruno' },
    { time: '12.06. 16:45', event: 'Delivered', user: 'Driver: Kruno' }
  ]
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 pb-20">
    <header class="bg-gray-900 text-white p-4">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <UButton color="gray" variant="ghost" icon="i-lucide-arrow-left" to="/admin/dashboard">Back to Dashboard</UButton>
        <span class="font-mono text-yellow-400">#{{ deliveryId }}</span>
      </div>
    </header>

    <main class="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-8 space-y-6">
        <UCard class="rounded-2xl">
          <template #header><h3 class="font-bold">Customer & Address</h3></template>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-gray-400 uppercase font-black">Name</p>
              <p class="font-bold">{{ delivery.customer.name }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 uppercase font-black">Phone</p>
              <p class="font-bold">{{ delivery.customer.phone }}</p>
            </div>
            <div class="col-span-2">
              <p class="text-xs text-gray-400 uppercase font-black">Delivery Address</p>
              <p class="font-bold">{{ delivery.address }}</p>
            </div>
          </div>
        </UCard>

        <UCard class="rounded-2xl">
          <template #header><h3 class="font-bold">Proof of Delivery (S3)</h3></template>
          <div class="aspect-video bg-gray-100 rounded-xl overflow-hidden border">
            <img :src="delivery.proofOfDelivery" class="w-full h-full object-cover" />
          </div>
        </UCard>
      </div>

      <div class="lg:col-span-4 space-y-6">
        <UCard class="rounded-2xl bg-gray-900 text-white">
          <template #header><h3 class="font-bold">Financials</h3></template>
          <div class="space-y-4">
            <div class="flex justify-between">
              <span class="text-gray-400">Amount Paid</span>
              <span class="font-black text-xl text-yellow-400">€{{ delivery.financials.price }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-gray-400">Stripe ID</span>
              <span class="font-mono">{{ delivery.financials.stripeId }}</span>
            </div>
          </div>
        </UCard>

        <UCard class="rounded-2xl">
          <template #header><h3 class="font-bold">Audit Log</h3></template>
          <div class="space-y-4">
            <div v-for="log in delivery.logs" :key="log.time" class="border-l-2 border-yellow-400 pl-4 py-1">
              <p class="text-xs font-black text-gray-400">{{ log.time }}</p>
              <p class="text-sm font-bold">{{ log.event }}</p>
              <p class="text-[10px] text-gray-500">By: {{ log.user }}</p>
            </div>
          </div>
        </UCard>
      </div>
    </main>
  </div>
</template>
