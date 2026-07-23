// Jednorazowa autoryzacja OAuth z Pinterestem (API v5). Wymagania:
//   1. Aplikacja na developers.pinterest.com (App ID + App secret)
//   2. W ustawieniach aplikacji dodany Redirect URI: http://localhost:8085/
// Uzycie: PINTEREST_APP_ID=... PINTEREST_APP_SECRET=... node scripts/pinterest/auth.mjs
// Otwiera link do zgody; po kliknieciu "Allow" zapisuje tokeny do .pinterest-token.json (gitignore).
import { createServer } from 'node:http'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT } from './lib.mjs'

const ID = process.env.PINTEREST_APP_ID
const SECRET = process.env.PINTEREST_APP_SECRET
if (!ID || !SECRET) {
  console.error('Ustaw PINTEREST_APP_ID i PINTEREST_APP_SECRET w srodowisku.')
  process.exit(1)
}

const REDIRECT = 'http://localhost:8085/'
const SCOPE = 'boards:read,boards:write,pins:read,pins:write'
const authUrl = `https://www.pinterest.com/oauth/?client_id=${ID}&redirect_uri=${encodeURIComponent(REDIRECT)}&response_type=code&scope=${SCOPE}`

console.log('\nOtworz w przegladarce i kliknij Allow:\n\n' + authUrl + '\n\nCzekam na przekierowanie...')

createServer(async (req, res) => {
  const code = new URL(req.url, REDIRECT).searchParams.get('code')
  if (!code) { res.end('Brak parametru code.'); return }
  try {
    const r = await fetch('https://api.pinterest.com/v5/oauth/token', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${ID}:${SECRET}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT }),
    })
    const tok = await r.json()
    if (!tok.refresh_token) throw new Error(JSON.stringify(tok))
    writeFileSync(join(ROOT, '.pinterest-token.json'), JSON.stringify(tok, null, 2))
    res.end('Autoryzacja OK - mozesz zamknac te karte.')
    console.log('\nZapisano .pinterest-token.json (refresh token wazny ~1 rok).')
    console.log('Do GitHub Actions dodaj sekrety: PINTEREST_APP_ID, PINTEREST_APP_SECRET, PINTEREST_REFRESH_TOKEN:')
    console.log('  PINTEREST_REFRESH_TOKEN = ' + tok.refresh_token)
  } catch (e) {
    res.end('Blad wymiany tokena: ' + e.message)
    console.error(e)
  }
  process.exit(0)
}).listen(8085)
