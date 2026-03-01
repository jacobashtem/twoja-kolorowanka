# Wytyczne: Redesign trybu kolorowania – Twoja Kolorowanka

## Kontekst
Przeprojektowanie trybu kolorowania na stronie twoja-kolorowanka.pl. Stack: **Nuxt 3 + Vue 3 + Tailwind CSS + Vuetify**. Obecna wersja jest funkcjonalna, ale toporny UX (szczególnie mobile – trzeba scrollować po kolor). Makieta referencyjna: `coloring-page-redesign.jsx` (React prototyp do inspiracji, implementacja w Vue).

---

## Architektura komponentów

```
pages/kolorowanki/[slug]/koloruj.vue        ← strona trybu kolorowania
├── components/coloring/
│   ├── ColoringCanvas.vue                   ← główny canvas (fabric.js lub konva)
│   ├── ColoringToolbar.vue                  ← narzędzia (fill/draw/eraser)
│   ├── ColorPalette.vue                     ← paleta kolorów (desktop sidebar)
│   ├── ColorPaletteMobile.vue               ← mobile bottom sheet drawer
│   ├── BrushSizeSelector.vue                ← wybór rozmiaru pędzla
│   ├── ZoomControls.vue                     ← zoom in/out + reset
│   └── ColoringTopBar.vue                   ← górny pasek (powrót, tytuł, zapis, undo)
├── composables/
│   ├── useColoringCanvas.ts                 ← logika canvas, rysowanie, fill, undo/redo
│   ├── useColorPalette.ts                   ← stan kolorów, historia kolorów, kategorie
│   ├── usePinchZoom.ts                      ← obsługa pinch-to-zoom na mobile
│   └── useColoringHistory.ts                ← undo/redo stack
```

---

## Layout: Desktop (≥768px)

```
┌─────────────────────────────────────────────────────────┐
│ [← Powrót]  Tytuł kolorowanki     [Zoom] [↩ Undo] [💾] │  ← TopBar
├────────────┬────────────────────────────────────────────┤
│            │                                            │
│  NARZĘDZIA │                                            │
│  [Wypełnij]│                                            │
│  [Rysuj]   │          CANVAS                            │
│  [Gumka]   │      (kolorowanka SVG                      │
│            │       na białym tle,                        │
│  ────────  │       z cieniem,                            │
│  PALETA    │       centrowana)                           │
│  Szybki    │                                            │
│  wybór     │                                            │
│  ────────  │                                            │
│  Kategorie │                                            │
│  (accordion│                                            │
│   z grupami│                                            │
│   kolorów) │                                            │
│  ────────  │                                            │
│  Rozmiar   │                                            │
│  pędzla    │                                            │
│  ────────  │                                            │
│  [■ #hex]  │                                            │
│  Wybrany   │                                            │
│  kolor     │                                            │
└────────────┴────────────────────────────────────────────┘
```

**Sidebar (300px, biały, scroll wewnętrzny):**
- Nagłówek z logo/emoji + "Tryb kolorowania"
- 3 przyciski narzędzi (wypełnij, rysuj, gumka) – podświetlenie aktywnego na zielony (#10B981)
- "Szybki wybór" – 10 najpopularniejszych kolorów w jednym rzędzie
- "Paleta kolorów" – accordion z kategoriami (Czerwone, Różowe, Pomarańczowe, Żółte, Zielone, Turkusowe, Niebieskie, Błękitne, Fioletowe, Indygo, Brązowe, Szare) – klik rozwija rzędy kolorów
- Rozmiar pędzla – 6 opcji (2, 5, 10, 18, 28, 40px) jako kółka
- Na dole sidebara: podgląd wybranego koloru (kwadrat + hex)

**Canvas area:**
- Tło: bardzo subtelna siatka kropek (#CBD5E1, opacity 0.3)
- Kolorowanka na białym "papierze" z border-radius 20px i cieniem
- Canvas skaluje się ze zoomem (CSS transform)

---

## Layout: Mobile (<768px)

```
┌───────────────────────────┐
│ [←] 🎨 Koloruj    [↩][💾] │  ← kompaktowy top bar
├───────────────────────────┤
│                           │
│                           │
│      CANVAS               │
│   (pełen ekran,           │
│    pinch-to-zoom,         │
│    pan/drag)              │
│                           │
│                           │
│   🔍 Rozsuń palce...      │  ← hint (znika po 3s)
│                           │
├───────────────────────────┤
│ [🪣][🖌️][◻️] [■ Kolor ▲] [-][+] │  ← floating bottom bar
└───────────────────────────┘

Po kliknięciu "Kolor ▲":
┌───────────────────────────┐
│   ──── (handle)           │
│ Paleta kolorów        [✕] │  ← bottom sheet drawer
│                           │
│ Szybki wybór              │
│ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○      │
│                           │
│ ▼ Czerwone ● ● ● ● ●     │
│ ▼ Zielone  ● ● ● ● ●     │
│ ... (accordion)           │
│                           │
│ Rozmiar pędzla            │
│ (○)(○)(●)(○)(○)(○)        │
└───────────────────────────┘
```

**Kluczowe zasady mobile:**
1. Canvas zajmuje CAŁY dostępny ekran (od top bar do bottom bar)
2. Paleta otwiera się jako **bottom sheet** (drawer z dołu, max-height: 75vh, backdrop blur)
3. Po wyborze koloru drawer NIE zamyka się automatycznie (użytkownik może chcieć porównać) – zamknięcie przez × lub tap na backdrop
4. Pinch-to-zoom na canvasie (use `touch-action: none` + obsługa gestów)
5. Floating bottom bar: semi-transparent z backdrop-filter: blur(12px)
6. Hint "Rozsuń palce aby przybliżyć" znika po 3 sekundach

---

## Paleta kolorów – specyfikacja

### Szybki wybór (zawsze widoczny, 10 kolorów):
```
#FF0000, #FF6D00, #FFD600, #00C853, #2979FF,
#AA00FF, #E91E63, #795548, #000000, #FFFFFF
```

### Kategorie (accordion):
```javascript
const COLOR_CATEGORIES = {
  "Czerwone":     ["#FF0000", "#E53935", "#C62828", "#FF5252", "#FF1744", "#B71C1C"],
  "Różowe":       ["#F48FB1", "#F06292", "#EC407A", "#E91E63", "#C2185B", "#880E4F", "#FCE4EC", "#FFCDD2"],
  "Pomarańczowe": ["#FF6D00", "#FF9100", "#FFAB40", "#FFD180", "#E65100", "#F4511E", "#FF7043", "#FFAB91"],
  "Żółte":        ["#FFD600", "#FFEA00", "#FFF176", "#FFF9C4", "#F9A825", "#FBC02D", "#FFD54F"],
  "Zielone":      ["#00C853", "#69F0AE", "#00E676", "#4CAF50", "#2E7D32", "#1B5E20", "#81C784", "#A5D6A7", "#C8E6C9"],
  "Turkusowe":    ["#00BFA5", "#00897B", "#004D40", "#80CBC4", "#B2DFDB", "#26A69A", "#4DB6AC"],
  "Niebieskie":   ["#2979FF", "#448AFF", "#82B1FF", "#BBDEFB", "#1565C0", "#0D47A1", "#42A5F5", "#90CAF9"],
  "Błękitne":     ["#039BE5", "#0277BD", "#01579B", "#4FC3F7", "#B3E5FC", "#29B6F6", "#81D4FA"],
  "Fioletowe":    ["#AA00FF", "#D500F9", "#E040FB", "#EA80FC", "#CE93D8", "#6A1B9A", "#4A148C", "#B39DDB"],
  "Indygo":       ["#304FFE", "#536DFE", "#8C9EFF", "#1A237E", "#283593", "#3F51B5", "#7986CB"],
  "Brązowe":      ["#795548", "#6D4C41", "#5D4037", "#4E342E", "#3E2723", "#A1887F", "#BCAAA4", "#D7CCC8"],
  "Szare":        ["#000000", "#212121", "#424242", "#616161", "#757575", "#9E9E9E", "#BDBDBD", "#E0E0E0", "#EEEEEE", "#F5F5F5", "#FFFFFF"],
};
```

### Kolor dot:
- Desktop: 30-36px, border-radius: 50%, shadow
- Mobile: 34px w drawer
- Wybrany: ring (#10B981) + scale(1.15)
- Biały: zawsze ma border (#D1D5DB)

---

## Canvas – technologia

### Zalecenie: Konva.js (vue-konva)
Dlaczego Konva zamiast fabric.js:
- Natywny wrapper Vue (`vue-konva`)
- Lepsza obsługa touch events
- Łatwiejszy pinch-to-zoom
- Dobre SVG import (choć wymaga konwersji)

### Alternatywa: Natywny Canvas 2D + własna logika
Jeśli SVG fill jest wystarczający (kolorowanka to SVG z regionami), rozważ prostsze podejście:
1. Renderuj SVG bezpośrednio w DOM
2. Fill: klik na `<path>`/`<ellipse>` → zmień `fill` attribute
3. Draw: nakładka `<canvas>` na wierzch SVG (position: absolute)
4. Export: serializuj SVG + canvas do obrazka

### Podejście hybrydowe (REKOMENDOWANE):
```
<div class="canvas-container" ref="canvasContainer">
  <!-- SVG kolorowanki - regiony klikalne w trybie fill -->
  <svg ref="coloringSvg" :style="{ transform: `scale(${zoom})` }">
    <path v-for="region in regions"
          :key="region.id"
          :d="region.d"
          :fill="region.fill"
          @click="handleFill(region)"
          class="cursor-pointer hover:opacity-80 transition-opacity" />
  </svg>
  
  <!-- Canvas overlay - tryb rysowania -->
  <canvas v-show="tool === 'draw' || tool === 'eraser'"
          ref="drawCanvas"
          class="absolute inset-0" />
</div>
```

### Zoom:
- Desktop: przyciski +/- oraz scroll wheel (z Ctrl)
- Mobile: pinch-to-zoom (Hammer.js lub własna implementacja)
- Zakres: 50% – 300%
- CSS transform na kontenerze (smooth transition)

### Pan (przesuwanie):
- Mobile: drag jednym palcem gdy zoom > 1
- Desktop: drag z wciśniętym spacebar lub scroll

---

## Undo/Redo

```typescript
// composables/useColoringHistory.ts
interface HistoryEntry {
  type: 'fill' | 'stroke';
  data: any; // region id + previous color, lub canvas snapshot
  timestamp: number;
}

const history: Ref<HistoryEntry[]> = ref([]);
const historyIndex: Ref<number> = ref(-1);

function pushState(entry: HistoryEntry) { ... }
function undo() { ... }
function redo() { ... }
```

- Dla fill: zapisuj `{ regionId, previousColor, newColor }`
- Dla draw: zapisuj snapshoty canvas (ImageData) co zakończenie stroke
- Limit: 50 stanów

---

## Zapis pracy

### Automatyczny (localStorage):
```javascript
// Co 30 sekund
function autoSave() {
  const state = {
    regions: serializeRegions(),
    canvasData: drawCanvas.toDataURL(),
    zoom, tool, selectedColor,
  };
  localStorage.setItem(`coloring_${slug}`, JSON.stringify(state));
}
```

### Ręczny (przycisk 💾):
- Eksport do PNG (merge SVG + canvas)
- Opcjonalnie: zapisz na serwer (jeśli user zalogowany)
- Toast z potwierdzeniem

---

## Styl i design tokens

```css
/* tailwind.config – extend */
colors: {
  coloring: {
    primary: '#10B981',      /* emerald-500 */
    'primary-dark': '#059669',
    surface: '#FFFFFF',
    'surface-alt': '#F8FAFC',
    border: '#E2E8F0',
    'text-primary': '#0F172A',
    'text-secondary': '#475569',
    'text-muted': '#94A3B8',
  }
}
```

### Zaokrąglenia:
- Przyciski narzędzi: rounded-2xl (16px)
- Color dot: rounded-full
- Canvas "papier": rounded-2xl (20px)
- Bottom sheet: rounded-t-3xl (24px)
- Małe przyciski: rounded-xl (12px)

### Cienie:
- Canvas: `shadow-lg` + `shadow-sm`
- Bottom bar (mobile): `shadow-xl`
- Bottom sheet: `shadow-2xl`
- Aktywne narzędzie: `shadow-md` z kolorem primary (rgba(16,185,129,0.35))

### Animacje:
- Bottom sheet: `transform transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]`
- Zoom: `transition-transform duration-300`
- Color dot hover: `transition-all duration-150`
- Accordion: `transition-all duration-200`

---

## Responsywność – breakpointy

| Breakpoint | Layout | Sidebar | Bottom bar | Paleta |
|---|---|---|---|---|
| <768px | Mobile | BRAK | Floating bottom bar | Bottom sheet drawer |
| ≥768px | Desktop | 300px lewy sidebar | BRAK | W sidebarze (scroll) |

Użyj `useMediaQuery` z VueUse lub Tailwind `md:` prefix.

---

## Accessibility

- Kolor dot: `aria-label="Kolor czerwony #FF0000"`, `role="radio"`, `aria-checked`
- Narzędzia: `aria-pressed` na aktywnym
- Zoom: przyciski z `aria-label="Powiększ"` / `"Pomniejsz"`
- Canvas: `role="img"`, `aria-label="Kolorowanka do kolorowania"`
- Bottom sheet: `role="dialog"`, `aria-modal="true"`, focus trap
- Keyboard: Tab nawigacja po narzędziach, Enter/Space aktywacja

---

## Kolejność implementacji

1. **Faza 1**: Layout (desktop + mobile) z placeholder canvas
2. **Faza 2**: Paleta kolorów (desktop sidebar + mobile drawer)
3. **Faza 3**: Canvas z trybem fill (klik na region SVG)
4. **Faza 4**: Canvas z trybem draw (overlay canvas)
5. **Faza 5**: Zoom + pan (desktop scroll, mobile pinch)
6. **Faza 6**: Undo/redo + zapis
7. **Faza 7**: Polish – animacje, transitions, loading states

---

## Dodatkowe uwagi

- **SVG kolorowanek**: każda kolorowanka to SVG z regionami (`data-region="..."` na pathach). Backend musi dostarczyć SVG z oznaczonymi regionami.
- **Performance**: na mobile unikaj re-renderów Vue przy rysowaniu – canvas manipuluj bezpośrednio przez ref, nie przez reactive state.
- **Touch**: `touch-action: none` na canvasie, obsługuj `touchstart/touchmove/touchend` + `pointerdown/pointermove/pointerup`.
- **Vuetify**: można użyć `v-bottom-sheet` dla mobile drawera, ale custom implementacja da lepszą kontrolę nad animacjami.
- **Tip**: Użyj `@vueuse/core` – `useEventListener`, `useMediaQuery`, `useLocalStorage`, `useThrottleFn`.
- **Header & Footer**: strona kolorowania korzysta ze wspólnych komponentów layoutu strony (AppHeader, AppFooter). Na desktop widoczne normalnie. Na mobile header jest kompaktowy (mniejsze logo, bez nawigacji), footer jest ukryty w trybie kolorowania (pełen ekran na canvas).

---

## Integracja z istniejącą stroną

### Header
Strona kolorowania korzysta z istniejącego `AppHeader` (lub odpowiednika w Twoim layoucie):
- **Desktop**: pełny header z logo "Twoja Kolorowanka", nawigacją (Strona główna, Blog, Szukaj, Kolorowanki – lista)
- **Mobile**: kompaktowy header – logo + hamburger menu (bez rozbudowanej nawigacji)
- Header jest częścią layoutu strony, NIE częścią komponentu kolorowania

### Footer
- **Desktop**: standardowy footer z linkami (Regulamin, Prawa autorskie, Polityka prywatności, RODO, Blog) + kontakt
- **Mobile**: footer jest ukryty w trybie kolorowania (bo canvas zajmuje ekran), widoczny dopiero po wyjściu z trybu kolorowania lub po scrollu
- Kolor footera: gradient `#3ECFA0 → #2DB88A` (zielony mint, jak na stronie)

---

## Jak użyć tych wytycznych z Claude Code

### Krok 1: Umieść pliki w repozytorium

Stwórz folder na dokumentację projektową w swoim repo:

```bash
mkdir -p docs/coloring-redesign
```

Skopiuj tam oba pliki:
- `docs/coloring-redesign/COLORING-REDESIGN-GUIDELINES.md` ← ten dokument
- `docs/coloring-redesign/coloring-page-redesign.jsx` ← makieta React (do inspiracji)

### Krok 2: Uruchom Claude Code

```bash
cd /sciezka/do/twojego/nuxt-projektu
claude
```

### Krok 3: Daj Claude Code kontekst

Wklej mu taki prompt startowy:

```
Przeczytaj plik docs/coloring-redesign/COLORING-REDESIGN-GUIDELINES.md – to są szczegółowe wytyczne na redesign trybu kolorowania dla mojej strony twoja-kolorowanka.pl.

Makieta inspiracyjna (React, ale my piszemy w Vue/Nuxt): docs/coloring-redesign/coloring-page-redesign.jsx

Mój stack: Nuxt 3, Vue 3 (Composition API + <script setup>), Tailwind CSS, Vuetify 3.

Zacznij od Fazy 1: stwórz layout strony kolorowania (desktop sidebar + canvas area + mobile bottom bar) jako nową stronę / komponent. Pokaż mi obecną strukturę projektu i zaproponuj gdzie umieścić nowe komponenty.
```

### Krok 4: Iteruj fazami

Po każdej fazie testuj i koryguj. Przykładowe follow-upy:

- `Faza 2: dodaj komponent palety kolorów z kategoriami (accordion) – desktop sidebar + mobile bottom sheet drawer`
- `Faza 3: zaimplementuj tryb fill – klik na region SVG zmienia mu fill na wybrany kolor`
- `Faza 4: dodaj tryb rysowania – canvas overlay nad SVG z obsługą pointer events`
- `Faza 5: zoom – przyciski na desktop, pinch-to-zoom na mobile (użyj @vueuse/gesture lub hammer.js)`
- `Faza 6: undo/redo + autozapis do localStorage`
- `Faza 7: animacje, transitions, loading states, edge cases`

### Tips do pracy z Claude Code na tym zadaniu

1. **Pokaż mu istniejący kod** – niech przeczyta aktualny plik strony kolorowania, zobaczy jak wygląda routing, layout, itp.
2. **Podawaj kontekst o stacku** – przypominaj o Vuetify, Tailwind, Composition API
3. **Testuj na mobile po każdej fazie** – UX mobile jest kluczowy
4. **Nie rób wszystkiego naraz** – fazy są po to, żeby Claude Code nie gubił kontekstu
5. **Makieta JSX** – powiedz mu "to jest makieta React, przetłumacz na Vue zachowując ten sam design i UX"
