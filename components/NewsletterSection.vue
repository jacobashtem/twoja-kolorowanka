<script setup>
const email = ref('')
const agreed = ref(false)
const status = ref('idle')
const errorMessage = ref('')

async function subscribe() {
  if (!email.value) {
    errorMessage.value = 'Podaj adres e-mail.'
    status.value = 'error'
    return
  }
  if (!agreed.value) {
    errorMessage.value = 'Musisz wyrazić zgodę na otrzymywanie newslettera.'
    status.value = 'error'
    return
  }

  status.value = 'loading'
  errorMessage.value = ''

  try {
    await $fetch('/.netlify/functions/newsletter-subscribe', {
      method: 'POST',
      body: { email: email.value },
    })

    status.value = 'success'
    email.value = ''
    agreed.value = false
  } catch (err) {
    status.value = 'error'
    errorMessage.value = err?.data?.error || 'Coś poszło nie tak. Spróbuj ponownie później.'
  }
}
</script>

<template>
  <section class="bg-tertiary-50 py-12 sm:py-16 mt-8">
    <UContainer>
      <div class="max-w-2xl mx-auto text-center">
        <!-- Heading -->
        <div class="flex flex-row flex-nowrap items-center mb-4 leading-tight tracking-tight">
          <span class="flex-grow border-t border-tertiary-300" aria-hidden="true"></span>
          <h2 class="px-4 py-2.5 rounded leading-none font-semibold text-xl sm:text-3xl bg-tertiary-500 text-white">
            Nie przegap nowych kolorowanek!
          </h2>
          <span class="flex-grow border-t border-tertiary-300" aria-hidden="true"></span>
        </div>

        <p class="text-base sm:text-lg font-light text-coolGray-700 mt-4 mb-8 px-4">
          Zapisz się do newslettera i otrzymuj co tydzień świeże, darmowe kolorowanki
          prosto na swoją skrzynkę. Żadnego spamu – tylko kreatywna zabawa dla Twojego dziecka!
        </p>

        <!-- Success -->
        <div
          v-if="status === 'success'"
          class="bg-white rounded-xl p-8 shadow-sm border border-sec-200"
        >
          <div class="text-sec-500 text-5xl mb-4">&#9989;</div>
          <p class="text-xl font-semibold text-sec-600 mb-2">Dziękujemy za zapis!</p>
          <p class="text-coolGray-600 font-light">
            Sprawdź swoją skrzynkę e-mail — wysłaliśmy wiadomość z potwierdzeniem.
            Nie zapomnij zajrzeć do folderu spam!
          </p>
        </div>

        <!-- Form -->
        <form
          v-else
          class="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-tertiary-200"
          @submit.prevent="subscribe"
        >
          <div class="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              v-model="email"
              type="email"
              placeholder="Twój adres e-mail"
              autocomplete="email"
              required
              class="flex-1 px-4 py-3 rounded-lg border border-coolGray-300 focus:border-tertiary-500 focus:ring-2 focus:ring-tertiary-200 outline-none transition-all text-base"
              :disabled="status === 'loading'"
            />
            <button
              type="submit"
              :disabled="status === 'loading'"
              class="px-6 py-3 bg-main-500 hover:bg-main-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {{ status === 'loading' ? 'Zapisuję...' : 'Zapisz się za darmo' }}
            </button>
          </div>

          <label class="flex items-start gap-2 text-left cursor-pointer">
            <input
              v-model="agreed"
              type="checkbox"
              class="mt-1 shrink-0 rounded border-coolGray-300 text-tertiary-500 focus:ring-tertiary-300"
              :disabled="status === 'loading'"
            />
            <span class="text-xs text-coolGray-500">
              Wyrażam zgodę na otrzymywanie newslettera z informacjami o nowych kolorowankach.
              Administratorem danych jest Twoja Kolorowanka.
              Możesz zrezygnować w dowolnym momencie klikając link w wiadomości.
            </span>
          </label>

          <p
            v-if="status === 'error'"
            class="text-main-500 text-sm mt-3 font-medium"
          >
            {{ errorMessage }}
          </p>
        </form>

        <p class="text-coolGray-400 text-xs mt-4 px-4">
          Twój e-mail jest bezpieczny. Nie udostępniamy go nikomu.
          Wysyłamy max. 1 wiadomość tygodniowo.
        </p>
      </div>
    </UContainer>
  </section>
</template>
