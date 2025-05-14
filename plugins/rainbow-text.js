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

      let html = ''
      let globalIndex = 0
      let currentWord = ''

      for (const char of text) {
        const color = colors[globalIndex % colors.length]
        const coloredChar = `<span style="color: ${color}">${char === ' ' ? '&nbsp;' : char}</span>`
        globalIndex++

        if (char === ' ') {
          // wrap the current word + space
          html += `<span class="inline-block mr-1">${currentWord}</span>${coloredChar}`
          currentWord = ''
        } else {
          currentWord += coloredChar
        }
      }

      // add last word
      if (currentWord) {
        html += `<span class="inline-block mr-1">${currentWord}</span>`
      }

      el.innerHTML = html
    }
  })
})
