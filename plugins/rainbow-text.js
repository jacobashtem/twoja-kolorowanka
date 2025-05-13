export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('rainbow-text', {
    mounted(el, binding) {
      const text = binding.value
      const colors = [
        '#D54DBF', '#F4BF22', '#6CC04A', '#00BDEB',
        '#E64B2E', '#7E57C2', '#D54DBF', '#00BDEB',
        '#E64B2E', '#F4BF22', '#F4BF22', '#D54DBF',
      ]

      el.setAttribute('aria-label', text)

      el.innerHTML = [...(text || '')].map((char, i) => {
        const color = colors[i % colors.length]
        return `<span style="color: ${color}">${char === ' ' ? '&nbsp;' : char}</span>`
      }).join('')
    }
  })
})
