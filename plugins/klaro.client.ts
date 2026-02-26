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
          title: 'Ustawienia prywatności',
          description:
            'Tu możesz ocenić i dostosować usługi, które chcielibyśmy wykorzystywać na tej stronie. To Ty decydujesz! Włącz lub wyłącz usługi zgodnie ze swoimi preferencjami.',
        },
        consentNotice: {
          description:
            'Cześć! Czy możemy uruchomić dodatkowe usługi do celów {purposes}? Możesz zmienić swoją zgodę w każdej chwili.',
          changeDescription: 'Nastąpiły zmiany od Twojej ostatniej wizyty. Zaktualizuj swoje zgody.',
          learnMore: 'Ustawienia',
        },
        acceptAll: 'Akceptuję wszystkie',
        acceptSelected: 'Akceptuję wybrane',
        decline: 'Odrzucam',
        ok: 'OK',
        save: 'Zapisz',
        close: 'Zamknij',
        purposes: {
          analytics: {
            title: 'Analityka i statystyki',
            description: 'Usługi pomagające analizować ruch na stronie i zachowania użytkowników.',
          },
          social: {
            title: 'Interakcje społecznościowe',
            description: 'Usługi umożliwiające komentowanie i interakcję z innymi użytkownikami.',
          },
        },
        gtm: {
          description: 'Google Tag Manager służy do zarządzania tagami analitycznymi i marketingowymi na naszej stronie.',
        },
        disqus: {
          description: 'System komentarzy umożliwiający dyskusję pod artykułami na naszym blogu.',
        },
      },
    },
    services: [
      {
        name: 'gtm',
        title: 'Google Tag Manager',
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
        title: 'Disqus',
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
})
