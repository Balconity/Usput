<script setup lang="ts">
import { computed } from 'vue'

const { data, pending, error, refresh } = await useFetch('/api/admin/orders')

const formatDate = (isoString: string) => {
  if (!isoString) return ''
  return new Date(isoString).toLocaleDateString('hr-HR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const columns = [
  { id: 'id', key: 'id', label: 'ID Narudžbe', accessorKey: 'id', header: 'ID Narudžbe' },
  { id: 'createdAt', key: 'createdAt', label: 'Zatraženo', accessorKey: 'createdAt', header: 'Zatraženo' },
  { id: 'customer', key: 'customer', label: 'Kupac i Lokacija', accessorKey: 'customer', header: 'Kupac i Lokacija' },
  { id: 'pickupDate', key: 'pickupDate', label: 'Datum isporuke', accessorKey: 'pickupDate', header: 'Datum isporuke' },
  { id: 'status', key: 'status', label: 'Status', accessorKey: 'status', header: 'Status' },
  { id: 'actions', key: 'actions', label: 'Akcije', header: 'Akcije' }
]

// Priprema i formatiranje redova za tablicu (s osiguračima)
const tableRows = computed(() => {
  // 1. Provjera postoje li uopće podaci
  if (!data.value || !data.value.orders) return []

  // 2. Sigurno mapiranje (ako neki podatak fali u testnoj narudžbi, neće srušiti tablicu)
  return data.value.orders.map((o: any) => ({
    rawId: o?.PK ? o.PK.replace('ORDER#', '') : 'nepoznato',
    id: o?.PK ? o.PK.replace('ORDER#', '').substring(0, 14) + '...' : 'N/A',
    createdAt: o?.createdAt ? formatDate(o.createdAt) : 'Nepoznato',
    customer: `${o?.personalInfo?.name || 'Nepoznato'} (${o?.delivery?.city || 'Nepoznato'})`,
    pickupDate: o?.delivery?.date ? new Date(o.delivery.date).toLocaleDateString('hr-HR') : 'N/A',
    status: o?.status || 'NOVO'
  }))
})
</script>

<template>
  <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-black text-gray-900">Nadzorna ploča narudžbi</h1>
        <p class="text-gray-500 mt-1">Pregled svih zahtjeva za dostavu iz IKEA-e.</p>
      </div>
      <UButton
        icon="i-lucide-refresh-cw"
        color="gray"
        variant="solid"
        class="shadow-sm font-bold"
        @click="refresh"
        :loading="pending"
      >
        Osvježi popis
      </UButton>
    </div>

    <UCard class="shadow-md overflow-hidden">

      <div v-if="pending" class="py-16 flex flex-col items-center justify-center text-gray-400">
        <UIcon name="i-lucide-loader-2" class="w-10 h-10 animate-spin mb-4" />
        <p class="font-medium text-lg">Učitavanje narudžbi...</p>
      </div>

      <div v-else-if="error" class="py-16 flex flex-col items-center justify-center text-red-500">
        <UIcon name="i-lucide-alert-circle" class="w-10 h-10 mb-4" />
        <p class="font-bold text-lg">Dogodila se greška prilikom učitavanja podataka.</p>
        <p class="text-sm mt-2 text-red-400">{{ error.message }}</p>
      </div>

      <div v-else-if="tableRows.length === 0" class="py-16 flex flex-col items-center justify-center text-gray-400">
        <UIcon name="i-lucide-inbox" class="w-10 h-10 mb-4 opacity-50" />
        <p class="font-medium text-lg">Trenutno nema zaprimljenih narudžbi.</p>
      </div>

      <UTable
        v-else
        :columns="columns"
        :data="tableRows"
        class="w-full"
        :ui="{ th: { base: 'uppercase tracking-wider text-gray-500 font-bold' } }"
      >
        <!-- U novom Nuxt UI-ju slotovi završavaju na "-cell" i podaci su u "row.original" -->
        <template #id-cell="{ row }">
          <span class="font-mono text-gray-600 font-medium bg-gray-50 px-2 py-1 rounded border">{{ row.original.id }}</span>
        </template>

        <template #customer-cell="{ row }">
          <span class="font-bold text-gray-900">{{ row.original.customer }}</span>
        </template>

        <template #status-cell="{ row }">
          <UBadge
            :color="row.original.status === 'NOVO' ? 'green' : (row.original.status === 'DOSTAVLJENO' ? 'gray' : 'yellow')"
            variant="soft"
            class="font-black tracking-wide"
          >
            {{ row.original.status }}
          </UBadge>
        </template>

        <template #actions-cell="{ row }">
          <div class="text-right">
            <UButton
              :to="`/admin/${row.original.rawId}`"
              color="black"
              variant="soft"
              size="xs"
              class="font-bold"
              trailing-icon="i-lucide-arrow-right"
            >
              Detalji
            </UButton>
          </div>
        </template>
      </UTable>

    </UCard>
  </div>
</template>
