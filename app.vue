<script setup>
// Define page transition
const pageTransition = {
  name: 'page',
  mode: 'out-in',
  onBeforeEnter: (el) => {
    if (typeof document !== 'undefined') {
      document.body.classList.add('page-transitioning');
    }
  },
  onAfterLeave: (el) => {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('page-transitioning');
    }
  }
};

const { $showKlaro } = useNuxtApp()

function openCookieSettings() {
  if (typeof window !== 'undefined' && $showKlaro) {
    $showKlaro()
  }
}
</script>

<template>
  <!-- <AppHeader /> -->
  <NuxtLayout>
    <NuxtPage :transition="pageTransition" />
  </NuxtLayout>
  <ClientOnly>
    <button
      class="cookie-settings-btn"
      title="Ustawienia prywatności"
      aria-label="Otwórz ustawienia plików cookie"
      @click="openCookieSettings"
    >
      🍪
    </button>
  </ClientOnly>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Loading state */
.page-transitioning {
  cursor: progress;
}

/* Cookie settings floating button */
.cookie-settings-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid rgba(200, 180, 220, 0.3);
  background: white;
  box-shadow: 0 2px 12px rgba(42, 27, 61, 0.12);
  cursor: pointer;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}
.cookie-settings-btn:hover {
  transform: scale(1.1);
  border-color: #9B72CF;
  box-shadow: 0 4px 16px rgba(155, 114, 207, 0.25);
}
</style>
