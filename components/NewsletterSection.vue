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
  <UContainer class="mb-12">
    <!-- Nagłówek w tym samym wzorcu, co pozostałe sekcje strony -->
    <Heading
      text="Odbierz 10 kolorowanek w prezencie"
      as="h2"
      backgroundColor="bg-sec-500"
      fontSize="text-xl sm:text-3xl"
      textColor="text-white"
    />

    <div class="rounded-2xl border border-sec-200 bg-sec-50 px-4 py-8 sm:px-10 sm:py-10">
      <div class="grid gap-8 md:grid-cols-[auto_1fr] md:items-center md:gap-12">

        <!-- Stos kartek – pokazuje, co dostaje zapisujący się -->
        <div
          class="relative mx-auto h-40 w-32 shrink-0 sm:h-52 sm:w-40"
          aria-hidden="true"
        >
          <div class="absolute inset-0 -rotate-[8deg] rounded-xl border border-coolGray-200 bg-white shadow-sm"></div>
          <div class="absolute inset-0 -rotate-[4deg] rounded-xl border border-coolGray-200 bg-white shadow-sm"></div>
          <div class="absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-coolGray-200 bg-white shadow-md">
            <span class="text-4xl font-bold leading-none text-main-500 sm:text-5xl">10</span>
            <span class="mt-2 text-xs font-semibold uppercase tracking-wider text-coolGray-600">kolorowanek</span>
            <span class="mt-0.5 text-xs font-light text-coolGray-400">PDF do druku</span>
          </div>
        </div>

        <div class="min-w-0">
          <!-- Sukces -->
          <div v-if="status === 'success'" class="text-center md:text-left">
            <p class="mb-2 text-xl font-semibold text-sec-700">Jeszcze jeden krok!</p>
            <p class="font-light text-coolGray-700">
              Wysłaliśmy Ci wiadomość z linkiem potwierdzającym. Kliknij go,
              a paczka 10 kolorowanek trafi prosto na Twoją skrzynkę.
              Zajrzyj też do folderu spam – czasem tam się chowa.
            </p>
          </div>

          <!-- Formularz -->
          <template v-else>
            <p class="mb-6 text-base font-light text-coolGray-700 sm:text-lg">
              Zapisz się, a od razu wyślemy Ci paczkę 10 gotowych do druku kolorowanek w PDF.
              Potem odezwiemy się tylko wtedy, gdy pojawi się coś nowego – żadnego spamu.
            </p>

            <form @submit.prevent="subscribe">
              <div class="mb-4 flex flex-col gap-3 sm:flex-row">
                <input
                  v-model="email"
                  type="email"
                  placeholder="Twój adres e-mail"
                  autocomplete="email"
                  required
                  :disabled="status === 'loading'"
                  class="min-w-0 flex-1 rounded-lg border border-coolGray-300 bg-white px-4 py-3 text-base outline-none transition-all focus:border-sec-500 focus:ring-2 focus:ring-sec-200"
                />
                <button
                  type="submit"
                  :disabled="status === 'loading'"
                  class="whitespace-nowrap rounded-lg bg-main-500 px-6 py-3 font-semibold text-white transition-all hover:bg-main-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {{ status === 'loading' ? 'Zapisuję...' : 'Odbierz paczkę' }}
                </button>
              </div>

              <label class="flex cursor-pointer items-start gap-2 text-left">
                <input
                  v-model="agreed"
                  type="checkbox"
                  :disabled="status === 'loading'"
                  class="mt-1 shrink-0 rounded border-coolGray-300 text-sec-500 focus:ring-sec-300"
                />
                <span class="text-xs text-coolGray-500">
                  Wyrażam zgodę na otrzymywanie newslettera z informacjami o nowych kolorowankach.
                  Informacje o administratorze danych i Twoich prawach znajdziesz w
                  <NuxtLink to="/polityka-prywatnosci" class="underline" @click.stop>polityce prywatności</NuxtLink>.
                  Możesz zrezygnować w dowolnym momencie, klikając link w wiadomości.
                </span>
              </label>

              <p v-if="status === 'error'" class="mt-3 text-sm font-medium text-main-600">
                {{ errorMessage }}
              </p>

              <p class="mt-4 text-xs font-light text-coolGray-400">
                Twój e-mail jest bezpieczny. Nie udostępniamy go nikomu. Wypisujesz się jednym kliknięciem.
              </p>
            </form>
          </template>
        </div>

      </div>
    </div>
  </UContainer>
</template>
