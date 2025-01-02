<script setup>
useHead({
    title: 'Twoja kolorowanka - twoje kolorowanki',
    description: 'Narysuj sobie piekne kolorowanki',
})
</script>

<template>
    <AppHeader />
    <main>
        <slot />
    </main>
    <AppFooter />
</template>
