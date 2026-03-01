<script setup></script>

<template>
  <div class="flex flex-col overflow-hidden" style="height: 100dvh">
    <!-- Navbar: full on desktop, hidden on mobile (coloring page has its own compact top bar) -->
    <AppNavbar class="hidden md:block shrink-0" />
    <div class="flex-1 min-h-0 overflow-hidden">
      <slot />
    </div>
    <!-- Footer: visible on desktop, hidden on mobile (canvas takes full height) -->
    <AppFooter class="hidden md:block shrink-0" />
  </div>
</template>
