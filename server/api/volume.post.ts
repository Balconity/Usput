import { defineEventHandler, readMultipartFormData, setResponseStatus } from 'h3'
import { extractText } from 'unpdf'

// Baza poznatih 'velikih' serija namještaja koje sigurno zahtijevaju kombi.
// Ovu listu možeš slobodno proširivati s vremenom!
const HUGE_FURNITURE_FAMILIES = [
  'PAX', 'KIVIK', 'SÖDERHAMN', 'FRIHETEN', 'MALM',
  'BESTÅ', 'METOD', 'KALLAX', 'HEMNES', 'VIMLE',
  'PLATSA', 'SLATTUM', 'IDANÄS', 'KLEPPSTAD'
]

export default defineEventHandler(async (event) => {
  try {
    const formData = await readMultipartFormData(event)

    if (!formData || formData.length === 0) {
      setResponseStatus(event, 400)
      return { success: false, error: 'Nisu primljeni podaci s forme.' }
    }

    const fileItem = formData.find(item => item.name === 'orderPdf')

    if (!fileItem || !fileItem.data) {
      setResponseStatus(event, 400)
      return { success: false, error: 'Molimo učitajte ispravnu PDF datoteku.' }
    }

    if (fileItem.type !== 'application/pdf') {
      setResponseStatus(event, 400)
      return { success: false, error: 'Učitana datoteka mora biti u PDF formatu.' }
    }

    // 1. Čitanje PDF-a
    const pdfBuffer = new Uint8Array(fileItem.data)
    const extractedData = await extractText(pdfBuffer)

    // Pretvaramo cijeli tekst u velika slova kako bismo lakše tražili ključne riječi
    const fullText = Array.isArray(extractedData.text)
      ? extractedData.text.join(' ').toUpperCase()
      : String(extractedData.text || '').toUpperCase()

    // 2. Brojanje različitih artikala
    const ikeaRegex = /\b\d{3}\.\d{3}\.\d{2}\b|\b\d{8}\b/g
    const matchedArticles = fullText.match(ikeaRegex) || []
    const uniqueArticles = [...new Set(matchedArticles)]

    // 3. Traženje velikog namještaja unutar teksta računa
    let containsHugeItems = false
    let foundHugeItems: string[] = []

    for (const family of HUGE_FURNITURE_FAMILIES) {
      // Ako PDF tekst sadrži npr. riječ "PAX"
      if (fullText.includes(family)) {
        containsHugeItems = true
        foundHugeItems.push(family)
      }
    }

    // 4. Logika za donošenje odluke "Kombi vs Auto"
    // Treba kombi AKO: smo našli neku od velikih serija namještaja ILI ako na računu ima više od 6 različitih artikala
    const requiresVan = containsHugeItems || uniqueArticles.length > 6

    return {
      success: true,
      data: {
        articlesFound: uniqueArticles.length,
        articleCodes: uniqueArticles,
        foundBigItems: foundHugeItems, // Vraćamo klijentu koje smo velike komade našli
        requiresVan: requiresVan
      }
    }

  } catch (error: any) {
    console.error('Greška na backendu prilikom čitanja PDF-a:', error)
    setResponseStatus(event, 500)
    return { success: false, error: error.message || 'Interna greška servera pri parsiranju PDF-a.' }
  }
})
