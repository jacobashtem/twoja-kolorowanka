import 'klaro/dist/klaro.css'
import '~/assets/css/klaro.css'
import * as Klaro from 'klaro/dist/klaro-no-css'

export default defineNuxtPlugin(() => {
  const consents = useState<Record<string, boolean>>('klaro-consents', () => ({}))

  function updateConsent(name: string, value: boolean) {
    consents.value = { ...consents.value, [name]: value }
  }

  // Google Consent Mode v2. Musi pushowac obiekt `arguments` (nie tablice) —
  // tego formatu oczekuje gtag/GTM przy komendach consent.
  function gtag(..._args: unknown[]) {
    window.dataLayer = window.dataLayer || []
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments)
  }

  // Stan domyslny: wszystko denied, zanim cokolwiek od Google sie zaladuje.
  // Wymog reklam w EOG (Consent Mode v2): ad_storage, ad_user_data, ad_personalization.
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted',
    wait_for_update: 500,
  })
  gtag('set', 'ads_data_redaction', true)

  // Inject GTM script manually on consent
  function injectGTM() {
    if (document.getElementById('klaro-gtm-script')) return
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })
    const s = document.createElement('script')
    s.id = 'klaro-gtm-script'
    s.async = true
    s.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-PMTV7XJ8'
    document.head.appendChild(s)
  }

  const klaroConfig = {
    version: 1,
    elementID: 'klaro',
    storageMethod: 'cookie',
    storageName: 'klaro',
    cookieExpiresAfterDays: 365,
    privacyPolicy: '/polityka-prywatnosci/',
    default: false,
    mustConsent: false,
    acceptAll: true,
    hideDeclineAll: false,
    lang: 'pl',
    translations: {
      pl: {
        privacyPolicyUrl: '/polityka-prywatnosci/',
        consentModal: {
          title: '🍪 Szanujemy Twoją prywatność',
          description:
            'Używamy ciasteczek, aby zapewnić prawidłowe działanie strony, analizować ruch i umożliwić Ci interakcję z innymi użytkownikami. Poniżej możesz zdecydować, na które z nich wyrażasz zgodę. Swoje preferencje możesz zmienić w dowolnym momencie.',
        },
        consentNotice: {
          description:
            'Nasza strona używa ciasteczek z następujących kategorii: {purposes}. Klikając „Akceptuję wszystkie”, wyrażasz zgodę na użycie ich wszystkich. Możesz też dostosować swoje preferencje, klikając „Ustawienia”.',
          changeDescription: 'Od Twojej ostatniej wizyty wprowadziliśmy zmiany. Prosimy o aktualizację preferencji dotyczących plików cookie.',
          learnMore: 'Ustawienia',
        },
        acceptAll: 'Akceptuję wszystkie',
        acceptSelected: 'Akceptuję wybrane',
        decline: 'Odrzucam wszystkie',
        ok: 'OK',
        save: 'Zapisz ustawienia',
        close: 'Zamknij',
        purposes: {
          niezbedne: {
            title: 'Niezbędne',
            description: 'Te pliki cookie są konieczne do prawidłowego funkcjonowania naszej strony i nie mogą zostać wyłączone.',
          },
          analytics: {
            title: 'Statystyczne',
            description: 'Statystyczne pliki cookie pomagają nam zrozumieć, jak użytkownicy korzystają ze strony. Zbierają i raportują anonimowe informacje o ruchu.',
          },
          social: {
            title: 'Społecznościowe',
            description: 'Społecznościowe pliki cookie pozwalają m.in. na komentowanie artykułów i łatwą interakcję z innymi użytkownikami.',
          },
          marketing: {
            title: 'Reklamowe',
            description: 'Reklamowe pliki cookie pozwalają wyświetlać reklamy dopasowane do Twoich zainteresowań. Bez zgody reklamy mogą być nadal wyświetlane, ale nie będą personalizowane.',
          },
        },
        'klaro-cookie': {
          description: 'Zapisuje Twój wybór dotyczący zgody na pliki cookie. Maksymalny czas przechowywania: 1 rok.',
        },
        gtm: {
          description: 'Narzędzie Google Analytics zbiera anonimowe statystyki, które pomagają nam ulepszać stronę. Ciasteczka: _ga (2 lata), _gid (24 godziny), _gat (1 minuta).',
        },
        adsense: {
          description: 'Google AdSense wyświetla reklamy, dzięki którym serwis pozostaje bezpłatny. Zgoda pozwala na personalizację reklam (Consent Mode v2).',
        },
        disqus: {
          description: 'System Disqus umożliwia dodawanie komentarzy pod materiałami. Ciasteczka: disqus_unique (1 rok).',
        },
      },
    },
    services: [
      {
        name: 'klaro-cookie',
        title: 'Pliki cookie serwisu',
        purposes: ['niezbedne'],
        cookies: [
          [/^klaro/, '/', '.twoja-kolorowanka.pl'],
        ],
        required: true,
        optOut: false,
        onlyOnce: false,
      },
      {
        name: 'gtm',
        title: 'Google Analytics',
        purposes: ['analytics'],
        cookies: [
          [/^_ga/, '/', '.twoja-kolorowanka.pl'],
          [/^_gid/, '/', '.twoja-kolorowanka.pl'],
          [/^_gcl/, '/', '.twoja-kolorowanka.pl'],
          [/^_gat/, '/', '.twoja-kolorowanka.pl'],
        ],
        callback: function (consent: boolean) {
          updateConsent('gtm', consent)
          gtag('consent', 'update', {
            analytics_storage: consent ? 'granted' : 'denied',
          })
          if (consent) injectGTM()
        },
        required: false,
        optOut: false,
        onlyOnce: true,
      },
      {
        name: 'adsense',
        title: 'Google AdSense (reklamy)',
        purposes: ['marketing'],
        cookies: [
          [/^__gads/, '/', '.twoja-kolorowanka.pl'],
          [/^__gpi/, '/', '.twoja-kolorowanka.pl'],
          [/^_gcl_au/, '/', '.twoja-kolorowanka.pl'],
        ],
        callback: function (consent: boolean) {
          updateConsent('adsense', consent)
          const state = consent ? 'granted' : 'denied'
          gtag('consent', 'update', {
            ad_storage: state,
            ad_user_data: state,
            ad_personalization: state,
          })
        },
        required: false,
        optOut: false,
        onlyOnce: false,
      },
      {
        name: 'disqus',
        title: 'Disqus (komentarze)',
        purposes: ['social'],
        cookies: [
          [/^disqus/, '/', '.disqus.com'],
          [/^__jid/, '/', '.disqus.com'],
        ],
        callback: function (consent: boolean) {
          updateConsent('disqus', consent)
        },
        required: false,
        optOut: false,
        onlyOnce: false,
      },
    ],
  }

  Klaro.setup(klaroConfig)

  // Ensure GTM is injected if consent was previously given (returning visitors)
  try {
    const manager = Klaro.getManager(klaroConfig)
    if (manager && manager.getConsent('gtm')) {
      injectGTM()
    }
  } catch (_) {
    // Klaro manager not ready yet, callback will handle it
  }

  return {
    provide: {
      showKlaro: () => Klaro.show(klaroConfig, true),
    },
  }
})