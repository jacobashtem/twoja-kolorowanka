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
</script>

<template>
  <!-- <AppHeader /> -->
  <NuxtLayout>
    <NuxtPage :transition="pageTransition" />
  </NuxtLayout>
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
</style>
