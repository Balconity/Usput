<template>
  <footer class="bg-gray-100 py-12 border-t border-gray-200">
    <UContainer class="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
      <div class="flex flex-col items-center md:items-start gap-3">
        <div class="text-xl font-bold opacity-60 grayscale">
          <span>Usput<span class="text-yellow-500">.</span></span>
        </div>
        <div class="text-xs text-gray-400 max-w-sm text-center md:text-left leading-relaxed">
          <p>"Usput" je komercijalni naziv usluge dostave.</p>
          <p class="mt-1">
            Uslugu pruža i naplaćuje obrt <strong>Balconity</strong>,
            vl. Tomislav Levkuš, Ivanečka ulica 41, 42000 Varaždin, OIB: 82780381100.
          </p>
        </div>
      </div>
      <div class="flex flex-col items-center md:items-end gap-3">
        <p class="text-sm text-gray-500 font-medium">
          &copy; {{ new Date().getFullYear() }} Usput. Sva prava pridržana.
        </p>
        <div class="flex items-center gap-4 text-xs text-gray-400 mt-2">
          <a href="/terms-of-service" class="hover:text-gray-600 transition-colors">Uvjeti korištenja</a>
          <span>|</span>
          <a href="/privacy-policy" class="hover:text-gray-600 transition-colors">Politika privatnosti</a>
          <span>|</span>
          <a href="/faq" class="hover:text-gray-600 transition-colors">Česta pitanja</a>
        </div>
        <p class="text-xs text-gray-400 mt-4 flex items-center gap-1.5">
          Powered by
          <a href="https://balconity.com" target="_blank" rel="noopener noreferrer" class="font-bold text-gray-500 hover:text-yellow-600 transition-colors flex items-center gap-1">
            Balconity
            <UIcon name="i-lucide-external-link" class="w-3 h-3" />
          </a>
        </p>
      </div>
    </UContainer>
  </footer>
</template>
