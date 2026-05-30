import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { gotScraping } from 'got-scraping'
import * as cheerio from 'cheerio'

// Ovo je simulacija tvoje buduće baze podataka (kasnije ćeš ovo zamijeniti pozivom prema pravoj bazi)
// Npr. šifra '30403571' je MALM komoda
const localDatabase: Record<string, { name: string, requiresVan: boolean }> = {
  '30403571': { name: 'MALM komoda', requiresVan: true },
  '80422323': { name: 'BILLY biblioteka', requiresVan: true },
  '20605131': { name: 'KALLAX regal', requiresVan: true }
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const listUrl = body?.url

    // Provjera valjanosti URL-a
    if (!listUrl || !listUrl.includes('ikea.com')) {
      setResponseStatus(event, 400)
      return { success: false, error: 'Molimo unesite ispravnu IKEA poveznicu na listu za kupovinu.' }
    }

    // 1. Skidamo HTML podijeljene liste
    const response = await gotScraping({
      url: listUrl,
      method: 'GET',
      responseType: 'text'
    })

    const $ = cheerio.load(response.body)

    // 2. Izvlačenje šifri proizvoda (Scraping linkova)
    // Tražimo sve <a> tagove. IKEA linkovi proizvoda uvijek sadrže '/p/' i završavaju šifrom.
    const foundItems = new Set<string>()

    $('main a').each((_, element) => {
      const href = $(element).attr('href')
      if (href && href.includes('/p/')) {
        // Regex hvata točno 8 uzastopnih brojeva prije kraja linka
        const match = href.match(/(\d{8})(?=\/|$)/)
        if (match) {
          foundItems.add(match[1]) // match[1] je naša čista šifra (npr. 30403571)
        }
      }
    })

    // U slučaju da je struktura HTML-a potpuno drugačija, radimo fallback pretragu teksta
    let uniqueArticles = Array.from(foundItems)
    if (uniqueArticles.length === 0) {
      const textToAnalyze = $('main').text() || $('body').text()
      const ikeaRegex = /\b\d{3}\.\d{3}\.\d{2}\b|\b\d{8}\b/g
      const textMatches = textToAnalyze.match(ikeaRegex) || []
      // Čistimo točkice da dobijemo goli 8-znamenkasti broj
      uniqueArticles = [...new Set(textMatches.map(c => c.replace(/\./g, '')))]
    }

    // 3. Usporedba s tvojom lokalnom bazom
    const missingFromDb: string[] = [] // Ovdje skupljamo one koje moramo ići "deep scrapati"
    const foundBigItems: string[] = []
    let requiresVan = false

    for (const articleCode of uniqueArticles) {
      const dbItem = localDatabase[articleCode]

      if (dbItem) {
        // Artikl je u bazi! Odmah provjeravamo je li masivan
        if (dbItem.requiresVan) {
          requiresVan = true
          foundBigItems.push(dbItem.name)
        }
      } else {
        // Nemamo ga u bazi! Zapisujemo ga kako bi ga naša iduća skripta posjetila
        missingFromDb.push(articleCode)
      }
    }

    // 4. Fallback logika: ako ima više od 6 bilo kakvih artikala, vjerojatno treba kombi
    if (uniqueArticles.length > 6) {
      requiresVan = true
    }

    return {
      success: true,
      data: {
        articlesFound: uniqueArticles.length,
        articleCodes: uniqueArticles,     // Sve šifre na listi
        missingFromDb: missingFromDb,     // Sifre koje fale u bazi (i koje moramo scrapati za dimenzije)
        foundBigItems: foundBigItems,     // Imena velikih komada koje smo prepoznali iz baze
        requiresVan: requiresVan          // Konačna odluka
      }
    }

  } catch (error: any) {
    console.error('Greška na backendu prilikom scrapanja liste:', error.message)
    setResponseStatus(event, 500)
    return { success: false, error: 'Nismo uspjeli pročitati listu. Provjerite je li link javno dostupan.' }
  }
})
