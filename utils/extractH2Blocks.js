// utils/extractH2Blocks.js

/**
 * Extracts blocks of AST nodes grouped by H2 headings.
 * Obsługuje zarówno array directly, jak i obiekt z .children.
 *
 * @param {Array|Object} root - doc.value.body lub już tablica węzłów.
 * @returns {Array<{ heading: string, nodes: any[] }>}
 */
export function extractH2Blocks(root) {
  // Ustalamy właściwą tablicę węzłów
  const content = Array.isArray(root)
    ? root
    : Array.isArray(root?.children)
      ? root.children
      : []

  const blocks = []
  let current = null

  for (const node of content) {
    const isH2 =
      (node.type === 'element' && node.tag === 'h2') ||
      (node.type === 'heading' && node.depth === 2)

    if (isH2) {
      if (current) blocks.push(current)
      // Wyciągamy tekst nagłówka
      let heading = ''
      if (Array.isArray(node.children)) {
        heading = node.children.map(n => n.value || '').join('')
      } else if (node.childrenText) {
        heading = node.childrenText
      }
      current = { heading, nodes: [] }
    } else if (current) {
      current.nodes.push(node)
    }
  }

  if (current) blocks.push(current)
  return blocks
}
