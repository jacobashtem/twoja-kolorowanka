<script setup>
// Zaproszenie do newslettera z pakietem powitalnym.
//
// DWA RÓŻNE KSZTAŁTY, I TO NIE JEST KOSMETYKA. Na desktopie modal z przyciemnieniem.
// Na mobile dolny arkusz BEZ zasłaniania treści — Google od 2017 obniża pozycje stronom
// z natrętnymi interstitialami na urządzeniach mobilnych, a serwis żyje z ruchu
// organicznego. Arkusz zakotwiczony na dole, zajmujący ułamek ekranu i pojawiający się
// dopiero po 30 s albo połowie przewinięcia, nie spełnia definicji interstitiala.
// Nie zamieniać tego na fullscreen „bo ładniej wygląda".

const OPOZNIENIE_MS = 30000
const PROG_SCROLLA = 0.5
const KLUCZ = 'tk_newsletter_popup'
const DNI_KARENCJI = 30

// Edytor kolorowania i strony prawne zostają bez zaproszenia: w edytorze dziecko
// jest w trakcie zabawy, a na stronach prawnych ktoś zwykle szuka konkretnej informacji.
const WYKLUCZONE = [/^\/koloruj/, /^\/regulamin/, /^\/polityka-prywatnosci/, /^\/obowiazek-informacyjny/, /^\/prawa-autorskie/]

const route = useRoute()
const widoczny = ref(false)
const email = ref('')
const agreed = ref(false)
const status = ref('idle')
const errorMessage = ref('')
const inputRef = ref(null)

let timer = null

function zapiszDecyzje (powod) {
  try {
    localStorage.setItem(KLUCZ, JSON.stringify({ powod, kiedy: Date.now() }))
  } catch { /* tryb prywatny albo zablokowany storage — trudno, pokaże się ponownie */ }
}

function wolnoPokazac () {
  if (WYKLUCZONE.some(re => re.test(route.path))) return false
  try {
    const zapis = localStorage.getItem(KLUCZ)
    if (!zapis) return true
    const { powod, kiedy } = JSON.parse(zapis)
    // Zapisani nie dostają zaproszenia nigdy więcej; zamykający — przez 30 dni.
    if (powod === 'zapisany') return false
    return Date.now() - kiedy > DNI_KARENCJI * 24 * 60 * 60 * 1000
  } catch {
    return true
  }
}

function pokaz () {
  if (widoczny.value || !wolnoPokazac()) return
  widoczny.value = true
  odepnijWyzwalacze()
  nextTick(() => inputRef.value?.focus())
}

function zamknij () {
  widoczny.value = false
  zapiszDecyzje('zamkniety')
}

function naScroll () {
  const doPrzewiniecia = document.documentElement.scrollHeight - window.innerHeight
  if (doPrzewiniecia <= 0) return
  if (window.scrollY / doPrzewiniecia >= PROG_SCROLLA) pokaz()
}

function naEsc (e) {
  if (e.key === 'Escape' && widoczny.value) zamknij()
}

function odepnijWyzwalacze () {
  if (timer) { clearTimeout(timer); timer = null }
  window.removeEventListener('scroll', naScroll)
}

async function subscribe () {
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
    zapiszDecyzje('zapisany')
  } catch (err) {
    status.value = 'error'
    errorMessage.value = err?.data?.error || 'Coś poszło nie tak. Spróbuj ponownie później.'
  }
}

onMounted(() => {
  if (!wolnoPokazac()) return
  timer = setTimeout(pokaz, OPOZNIENIE_MS)
  window.addEventListener('scroll', naScroll, { passive: true })
  window.addEventListener('keydown', naEsc)
})

onBeforeUnmount(() => {
  odepnijWyzwalacze()
  window.removeEventListener('keydown', naEsc)
})
</script>

<template>
  <ClientOnly>
    <Transition name="tk-pop">
      <div v-if="widoczny" class="tk-popup-root">
        <!-- Przyciemnienie TYLKO na desktopie: na mobile zasłonięcie treści to sygnał
             natrętnego interstitiala, a dolny arkusz ma zostać elementem strony. -->
        <div class="tk-overlay" @click="zamknij" aria-hidden="true"></div>

        <div
          class="tk-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tk-popup-tytul"
        >
          <button type="button" class="tk-zamknij" @click="zamknij" aria-label="Zamknij">
            &#10005;
          </button>

          <!-- Sukces -->
          <div v-if="status === 'success'" class="py-2 text-center">
            <p class="mb-1 text-lg font-semibold text-sec-700">Jeszcze jeden krok!</p>
            <p class="text-sm font-light text-coolGray-700">
              Kliknij link potwierdzający w mailu, a pakiet trafi na Twoją skrzynkę.
            </p>
          </div>

          <template v-else>
            <div class="sm:flex sm:items-start sm:gap-5">
              <!-- Miniatura pakietu, ukryta na najmniejszych ekranach dla oszczędności miejsca -->
              <div class="relative hidden h-24 w-20 shrink-0 sm:block" aria-hidden="true">
                <div class="absolute inset-0 -rotate-6 rounded-lg border border-coolGray-200 bg-white shadow-sm"></div>
                <div class="absolute inset-0 flex flex-col items-center justify-center rounded-lg border border-coolGray-200 bg-white shadow">
                  <span class="text-2xl font-bold leading-none text-main-500">50</span>
                  <span class="mt-1 text-[10px] font-semibold uppercase tracking-wide text-coolGray-500">kolorowanek</span>
                </div>
              </div>

              <div class="min-w-0 flex-1">
                <h2 id="tk-popup-tytul" class="pr-12 text-base font-semibold leading-snug text-coolGray-800 sm:pr-10 sm:text-xl">
                  Dołącz do newslettera i odbierz 50 darmowych kolorowanek!
                </h2>
                <p class="mt-1 text-sm font-light text-coolGray-600">
                  Pakiet „Kim chcę zostać?" – zawody, o których marzą dzieci.
                  Jeden plik PDF, gotowy do druku.
                </p>

                <form class="mt-3" @submit.prevent="subscribe">
                  <div class="flex flex-col gap-2 sm:flex-row">
                    <input
                      ref="inputRef"
                      v-model="email"
                      type="email"
                      placeholder="Twój adres e-mail"
                      autocomplete="email"
                      required
                      :disabled="status === 'loading'"
                      class="min-w-0 flex-1 rounded-lg border border-coolGray-300 px-3 py-2.5 text-base outline-none transition-all focus:border-sec-500 focus:ring-2 focus:ring-sec-200"
                    />
                    <button
                      type="submit"
                      :disabled="status === 'loading'"
                      class="whitespace-nowrap rounded-lg bg-main-500 px-5 py-2.5 font-semibold text-white transition-all hover:bg-main-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-600 disabled:opacity-50"
                    >
                      {{ status === 'loading' ? 'Zapisuję...' : 'Pobieram' }}
                    </button>
                  </div>

                  <label class="mt-2 flex cursor-pointer items-start gap-2">
                    <input
                      v-model="agreed"
                      type="checkbox"
                      :disabled="status === 'loading'"
                      class="mt-0.5 shrink-0 rounded border-coolGray-300 text-sec-500 focus:ring-sec-300"
                    />
                    <span class="text-[11px] leading-snug text-coolGray-500">
                      Zgadzam się na otrzymywanie newslettera. Informacje o administratorze
                      danych i Twoich prawach znajdziesz w
                      <NuxtLink to="/polityka-prywatnosci" class="underline" @click.stop>polityce prywatności</NuxtLink>.
                      Możesz zrezygnować w każdej chwili.
                    </span>
                  </label>

                  <p v-if="status === 'error'" class="mt-2 text-xs font-medium text-main-600">
                    {{ errorMessage }}
                  </p>
                </form>
              </div>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </ClientOnly>
</template>

<style scoped>
.tk-popup-root { position: fixed; inset: 0; z-index: 60; pointer-events: none; }
.tk-panel, .tk-overlay { pointer-events: auto; }

/* ── Mobile: dolny arkusz, bez przyciemnienia ─────────────────────────────── */
.tk-overlay { display: none; }

.tk-panel {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  max-height: 45vh;
  overflow-y: auto;
  background: #fff;
  border-top: 1px solid #E5E7EB;
  border-radius: 1rem 1rem 0 0;
  box-shadow: 0 -8px 30px rgba(0, 0, 0, .12);
  padding: 1rem 1rem calc(1rem + env(safe-area-inset-bottom));
}

/* 44x44 to minimalny wygodny cel dotykowy wg WCAG; wczesniej bylo 32 px i szary
   #9CA3AF na bialym tle, czyli przycisk praktycznie niewidoczny. Tlo jest po to,
   zeby odcinal sie od kartki, a nie zlewal z trescia pod spodem. */
.tk-zamknij {
  position: absolute; top: .375rem; right: .375rem;
  width: 2.75rem; height: 2.75rem;
  display: flex; align-items: center; justify-content: center;
  border-radius: 9999px;
  color: #4B5563; font-size: 1.15rem; line-height: 1;
  background: #F3F4F6; cursor: pointer;
  transition: background-color .15s ease, color .15s ease;
}
.tk-zamknij:hover { background: #E5E7EB; color: #111827; }
.tk-zamknij:focus-visible { outline: 2px solid #40ceac; outline-offset: 2px; }

/* ── Desktop: wyśrodkowany modal z przyciemnieniem ────────────────────────── */
@media (min-width: 768px) {
  .tk-overlay { display: block; position: absolute; inset: 0; background: rgba(17, 24, 39, .45); }
  .tk-panel {
    top: 50%; left: 50%; right: auto; bottom: auto;
    transform: translate(-50%, -50%);
    width: min(38rem, calc(100vw - 3rem));
    max-height: none;
    border: 1px solid #E5E7EB;
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, .25);
  }
}

/* ── Wejście ──────────────────────────────────────────────────────────────── */
.tk-pop-enter-active, .tk-pop-leave-active { transition: opacity .25s ease; }
.tk-pop-enter-active .tk-panel, .tk-pop-leave-active .tk-panel { transition: transform .25s ease; }
.tk-pop-enter-from, .tk-pop-leave-to { opacity: 0; }
.tk-pop-enter-from .tk-panel, .tk-pop-leave-to .tk-panel { transform: translateY(100%); }

@media (min-width: 768px) {
  .tk-pop-enter-from .tk-panel, .tk-pop-leave-to .tk-panel { transform: translate(-50%, -46%); }
}

@media (prefers-reduced-motion: reduce) {
  .tk-pop-enter-active, .tk-pop-leave-active,
  .tk-pop-enter-active .tk-panel, .tk-pop-leave-active .tk-panel { transition: none; }
  .tk-pop-enter-from .tk-panel, .tk-pop-leave-to .tk-panel { transform: none; }
}
</style>
