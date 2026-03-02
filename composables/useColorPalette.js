export const QUICK_COLORS = [
  '#FF0000', '#FF6D00', '#FFD600', '#00C853', '#2979FF',
  '#AA00FF', '#E91E63', '#795548', '#000000', '#FFFFFF',
]

export const BRUSH_SIZES = [2, 5, 10, 18, 28, 40]

export const COLOR_CATEGORIES = {
  'Czerwone':     ['#FF0000', '#E53935', '#C62828', '#FF5252', '#FF1744', '#B71C1C'],
  'Różowe':       ['#F48FB1', '#F06292', '#EC407A', '#E91E63', '#C2185B', '#880E4F', '#FCE4EC', '#FFCDD2'],
  'Pomarańczowe': ['#FF6D00', '#FF9100', '#FFAB40', '#FFD180', '#E65100', '#F4511E', '#FF7043', '#FFAB91'],
  'Żółte':        ['#FFD600', '#FFEA00', '#FFF176', '#FFF9C4', '#F9A825', '#FBC02D', '#FFD54F'],
  'Zielone':      ['#00C853', '#69F0AE', '#00E676', '#4CAF50', '#2E7D32', '#1B5E20', '#81C784', '#A5D6A7', '#C8E6C9'],
  'Turkusowe':    ['#00BFA5', '#00897B', '#004D40', '#80CBC4', '#B2DFDB', '#26A69A', '#4DB6AC'],
  'Niebieskie':   ['#2979FF', '#448AFF', '#82B1FF', '#BBDEFB', '#1565C0', '#0D47A1', '#42A5F5', '#90CAF9'],
  'Błękitne':     ['#039BE5', '#0277BD', '#01579B', '#4FC3F7', '#B3E5FC', '#29B6F6', '#81D4FA'],
  'Fioletowe':    ['#AA00FF', '#D500F9', '#E040FB', '#EA80FC', '#CE93D8', '#6A1B9A', '#4A148C', '#B39DDB'],
  'Indygo':       ['#304FFE', '#536DFE', '#8C9EFF', '#1A237E', '#283593', '#3F51B5', '#7986CB'],
  'Brązowe':      ['#795548', '#6D4C41', '#5D4037', '#4E342E', '#3E2723', '#A1887F', '#BCAAA4', '#D7CCC8'],
  'Szare':        ['#000000', '#212121', '#424242', '#616161', '#757575', '#9E9E9E', '#BDBDBD', '#E0E0E0', '#EEEEEE', '#F5F5F5', '#FFFFFF'],
}

export function useColorPalette() {
  return {
    QUICK_COLORS,
    BRUSH_SIZES,
    COLOR_CATEGORIES,
  }
}
