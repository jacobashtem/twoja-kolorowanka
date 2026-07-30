<script setup></script>

<template>
  <div class="flex flex-col overflow-hidden" style="height: 100dvh">
    <!-- Navbar: full on desktop, hidden on mobile (coloring page has its own compact top bar) -->
    <AppNavbar class="hidden md:block shrink-0" />
    <div class="flex-1 min-h-0 overflow-hidden">
      <slot />
    </div>
    <!-- Footer: visible on desktop, hidden on mobile (canvas takes full height).
         Wersja zwięzła — pełne listy kategorii i zestawów zabierały tu wysokość płótnu,
         przez co kolorowanka wyświetlała się mała. Zostają linki prawne i kontakt. -->
    <AppFooter zwiezla class="hidden md:block shrink-0" />
  </div>
</template>
