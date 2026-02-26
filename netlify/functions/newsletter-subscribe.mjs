// Netlify Function – proxy do MailerLite API
// Env variables wymagane w Netlify Dashboard → Site settings → Environment variables:
//   MAILERLITE_API_KEY  – API token z MailerLite (Settings → API)
//   MAILERLITE_GROUP_ID – ID grupy subskrybentów z MailerLite

export default async (request) => {
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const { email } = await request.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Podaj poprawny adres e-mail.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY
    const MAILERLITE_GROUP_ID = process.env.MAILERLITE_GROUP_ID

    if (!MAILERLITE_API_KEY || !MAILERLITE_GROUP_ID) {
      console.error('Missing MAILERLITE_API_KEY or MAILERLITE_GROUP_ID')
      return new Response(
        JSON.stringify({ error: 'Błąd konfiguracji serwera.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
      },
      body: JSON.stringify({
        email,
        groups: [MAILERLITE_GROUP_ID],
      }),
    })

    const data = await response.json()

    if (response.ok) {
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // MailerLite zwraca 422 jeśli email jest niepoprawny lub już istnieje
    if (response.status === 422 && data.message?.includes('already')) {
      return new Response(
        JSON.stringify({ error: 'Ten adres e-mail jest już zapisany do newslettera.' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: data.message || 'Nie udało się zapisać do newslettera.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Newsletter subscribe error:', error)
    return new Response(
      JSON.stringify({ error: 'Wystąpił błąd. Spróbuj ponownie później.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
