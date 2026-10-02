// SVG → PDF A4, wspólne dla narzędzi, które kończą na gotowym pliku do druku.
import { createWriteStream } from 'node:fs'
import PDFDocument from 'pdfkit'
import SVGtoPDF from 'svg-to-pdfkit'

// A4 w punktach PDF (72 dpi) + margines na dziurkacz i chwyt dłoni
const A4_W = 595.28, A4_H = 841.89, MARGIN = 36

// Wektor trafia do PDF-a jako wektor, więc druk jest ostry niezależnie od skali.
export function doPdf (svg, sciezka) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0 })
    const ws = createWriteStream(sciezka)
    doc.pipe(ws)
    SVGtoPDF(doc, svg, MARGIN, MARGIN, {
      width: A4_W - 2 * MARGIN,
      height: A4_H - 2 * MARGIN,
      preserveAspectRatio: 'xMidYMid meet',
      assumePt: false
    })
    doc.end()
    ws.on('finish', resolve)
    ws.on('error', reject)
  })
}
