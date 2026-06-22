<template>
  <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
    <UContainer class="flex items-center justify-between py-4">
      <div class="flex items-center gap-2 text-xl font-bold">
        <NuxtLink to="/">
          <span>Usput<span class="text-yellow-500">.</span></span>
        </NuxtLink>
      </div>
      <div class="flex items-center">
        <NuxtLink
          to="/admin/login"
          class="p-2 text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 transition-all rounded-full flex items-center justify-center"
          title="Prijava za administratore"
          aria-label="Prijava"
        >
          <UIcon name="i-lucide-user" class="w-6 h-6" />
        </NuxtLink>
      </div>
    </UContainer>
  </header>
</template>
