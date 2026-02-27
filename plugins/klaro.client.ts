import 'klaro/dist/klaro.css'
import '~/assets/css/klaro.css'
import * as Klaro from 'klaro/dist/klaro-no-css'

export default defineNuxtPlugin(() => {
  const consents = useState<Record<string, boolean>>('klaro-consents', () => ({}))

  function updateConsent(name: string, value: boolean) {
    consents.value = { ...consents.value, [name]: value }
  }

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
            'Używamy plików cookie, aby zapewnić prawidłowe działanie strony, analizować ruch i umożliwić interakcję z innymi użytkownikami. Poniżej możesz wybrać, na które kategorie plików cookie wyrażasz zgodę. Możesz zmienić swoje preferencje w dowolnym momencie.',
        },
        consentNotice: {
          description:
            'Nasza strona używa plików cookie do celów {purposes}. Klikając „Akceptuję wszystkie", wyrażasz zgodę na wszystkie kategorie cookies. Możesz też dostosować swoje preferencje klikając „Ustawienia".',
          changeDescription: 'Nastąpiły zmiany od Twojej ostatniej wizyty. Zaktualizuj swoje zgody.',
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
            description: 'Te pliki cookie są konieczne do prawidłowego działania strony. Nie można ich wyłączyć.',
          },
          analytics: {
            title: 'Statystyczne',
            description: 'Pliki cookie statystyczne pomagają nam zrozumieć, w jaki sposób użytkownicy korzystają ze strony, zbierając anonimowe informacje o ruchu i zachowaniach.',
          },
          social: {
            title: 'Społecznościowe',
            description: 'Pliki cookie społecznościowe umożliwiają komentowanie artykułów i interakcję z innymi użytkownikami.',
          },
        },
        'klaro-cookie': {
          description: 'Przechowuje informacje o Twoich preferencjach dotyczących plików cookie (ten wybór). Maksymalny okres przechowywania: 1 rok.',
        },
        gtm: {
          description: 'Google Analytics zbiera anonimowe statystyki odwiedzin, które pomagają nam ulepszać stronę. Cookies: _ga (2 lata), _gid (24h), _gat (1 min).',
        },
        disqus: {
          description: 'System komentarzy Disqus umożliwia dyskusję pod artykułami na naszym blogu. Cookies: disqus_unique (1 rok).',
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
          if (consent) injectGTM()
        },
        required: false,
        optOut: false,
        onlyOnce: true,
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
