// Stan migracji z Freepika na Recrafta, liczony z plików, a nie z pamięci.
//
// Odpowiada na pytanie „które kategorie mają jeszcze grafiki ze stocka i od czego zacząć".
// Panel selekcji widzi tylko to, co leży w `lineart-work/`; tu przechodzimy CAŁY content
// i każdy liść osobno.
//
// Pochodzenie pliku rozpoznajemy po DWÓCH znakach, bo żaden nie wystarcza sam
// (zmierzone 2026-10-24 na 4291 liściach):
//   • komentarz „Adobe Illustrator" w nagłówku — 3482 pliki ze stocka; 219 z nich NIE ma
//     ani jednej grupy `<g>`, więc sam test grup brał je za nasze;
//   • grupa `<g>` gdziekolwiek w pliku — łapie 21 plików ze stocka eksportowanych czymś
//     innym niż Illustrator (cała kategoria flamingów, lalki-37, zajace-48, wedlug-kodu-38).
// Nasze pliki (potrace, wektoryzator Recrafta, natywny wektor) nie mają żadnego z nich.
// Sam `<defs>` z gradientem NIE jest oznaką stocka — to podpis wektoryzatora Recrafta.
//
// Ścieżkę pliku czytamy z pola `image:` liścia, nigdy ze składania nazwy kategorii —
// koty, koniki, kroliczki i pieski leżą w public/ bez przedrostka `zwierzeta/`.
import { readdirSync, statSync, existsSync, readFileSync, openSync, readSync, closeSync } from 'node:fs'
import { join } from 'node:path'
import { KATEGORIE } from '../../prompty/kategorie.mjs'
import { MIKS, SERIA_DOMYSLNA } from '../../prompty/style.mjs'

const CONTENT = 'content'
const PUBLIC = 'public'
// MUSI się zgadzać z `KAFLI_NA_SEKCJE` w pages/[...slug].vue i w stat-kategorie.mjs.
const KAFLI_NA_SEKCJE = 4

const jestLiczba = (s) => /^[0-9]+$/.test(s)
const pole = (tresc, nazwa) => tresc.match(new RegExp(`^${nazwa}:\\s*["']?(.+?)["']?\\s*$`, 'm'))?.[1]

// SVG-i ważą do 2,5 MB, a czytanie całych 4 tys. plików trwa kilkanaście sekund. Najpierw
// więc sam nagłówek — rozstrzyga 80% przypadków — i dopiero bez znacznika Illustratora
// cały plik, bo grupa potrafi leżeć daleko za pierwszymi kilobajtami (dom-20).
const NAGLOWEK = 1024
const bufor = Buffer.alloc(NAGLOWEK)
function zeStocka (plik) {
  const fd = openSync(plik, 'r')
  let poczatek
  try { poczatek = bufor.toString('utf8', 0, readSync(fd, bufor, 0, NAGLOWEK, 0)) }
  finally { closeSync(fd) }
  if (poczatek.includes('Adobe Illustrator')) return true
  return /<g[\s>]/.test(readFileSync(plik, 'utf8'))
}

function liczH2 (sciezka) {
  try {
    const body = readFileSync(join(CONTENT, sciezka, 'index.md'), 'utf8').replace(/^---[\s\S]*?\n---\n/, '')
    return (body.match(/^##\s+\S/gm) ?? []).length
  } catch { return 0 }
}

function zbierzKategorie (dir = CONTENT, sciezka = [], wynik = []) {
  let wpisy
  try { wpisy = readdirSync(dir) } catch { return wynik }
  const podkatalogi = wpisy.filter(n => { try { return statSync(join(dir, n)).isDirectory() } catch { return false } })
  const liscie = podkatalogi.filter(jestLiczba)
  if (sciezka.length && liscie.length) wynik.push({ sciezka: sciezka.join('/'), katalogi: liscie.map(n => join(dir, n)) })
  for (const d of podkatalogi.filter(n => !jestLiczba(n))) zbierzKategorie(join(dir, d), [...sciezka, d], wynik)
  return wynik
}

// Zwraca jedną pozycję na kategorię z kolorowankami. `status`:
//   stock      — same grafiki ze stocka, nic jeszcze nie ruszone
//   czesciowo  — część liści już nasza, część jeszcze ze stocka
//   nasza      — zero plików ze stocka
export function stanMigracji () {
  return zbierzKategorie().map(({ sciezka, katalogi }) => {
    let stock = 0, nasze = 0, brak = 0
    for (const kat of katalogi) {
      let img
      try { img = pole(readFileSync(join(kat, 'index.md'), 'utf8'), 'image') } catch { /* liść bez index.md */ }
      const plik = img && join(PUBLIC, img.replace(/^\//, ''))
      if (!plik || !existsSync(plik)) { brak++; continue }
      if (zeStocka(plik)) stock++; else nasze++
    }
    const cfg = KATEGORIE[sciezka]
    const minimum = liczH2(sciezka) * KAFLI_NA_SEKCJE
    return {
      sciezka,
      liscie: katalogi.length,
      stock, nasze, brak, minimum,
      wKsiedze: Boolean(cfg),
      // Generator odmawia startu na kategorii bez wariantów, więc „ma warianty" znaczy
      // dokładnie „można już puszczać generowanie".
      maWarianty: Boolean(cfg?.warianty?.length),
      status: stock === 0 ? 'nasza' : nasze === 0 ? 'stock' : 'czesciowo'
    }
  })
}

// Komenda serii dla kategorii — podział na style liczy `generuj-miks.mjs` z `prompty/style.mjs`
// (trzon whimsy + po 3 z każdego pozostałego stylu), więc tu jest tylko jej wywołanie.
// Zawsze z `--dry-run`: kopiuje się ją do terminala, a pierwsze uruchomienie ma pokazać
// prompty i koszt, nie wydać kredytów.
// Przy pojazdach dokładamy `lineart2` — wbudowany „Line art" na V2 bił tam V3 (kombajny),
// a w domyślnym miksie go nie ma, bo przy zwierzętach wypadał słabo.
export function komendaMiksu (sciezka) {
  const miks = sciezka.startsWith('pojazdy/')
    ? ` --miks=${[...MIKS.slice(0, 4), 'lineart2', ...MIKS.slice(4)].join(',')}`
    : ''
  return `node scripts/generuj-miks.mjs ${sciezka} --count=${SERIA_DOMYSLNA} --goly${miks} --dry-run`
}
