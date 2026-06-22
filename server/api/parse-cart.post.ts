export default defineEventHandler(async (event) => {
  try {
    // Primamo sirovi tekst koji je korisnik zalijepio u formu
    const body = await readBody(event);
    const rawText = body.text || ''; // Npr. "Hej, pogledaj moju... https://applink.ikea.com/aS9M4U8x5E"

    // 1. KORAK: Regex ekspresija koja pronalazi URL unutar bilo kakvog teksta
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = rawText.match(urlRegex);

    if (!matches || matches.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nismo pronašli važeći link u poruci. Molimo zalijepite cijelu poruku s linkom.'
      });
    }

    const shortUrl = matches[0]; // Izvučeni link: "https://applink.ikea.com/aS9M4U8x5E"

    // 2. KORAK: Slanje zahtjeva na skraćeni link kako bismo popratili preusmjeravanja (Redirects)
    // Native Node.js 'fetch' automatski prati preusmjeravanja (redirect: 'follow')
    const response = await fetch(shortUrl, {
      method: 'GET',
      headers: {
        // Pretvaramo se da smo obični web preglednik kako nas IKEA ne bi blokirala
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    // response.url sadrži FINALNU web adresu na koju je link preusmjeren!
    const finalUrl = response.url;

    // Primjer što će finalUrl biti:
    // https://www.ikea.com/hr/hr/shoppingcart/?token=XXXXXX ili sličan format s ID-jem košarice.

    // 3. KORAK: Provjera je li to doista IKEA link
    if (!finalUrl.includes('ikea.com')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Pronađeni link ne vodi do IKEA stranice.'
      });
    }

    // Ovdje sada imaš 'finalUrl' i možeš pokrenuti svoju postojeću logiku
    // koja čita podatke o proizvodima (scraping ili IKEA-in interni API ako ga koristiš)

    return {
      success: true,
      extractedShortUrl: shortUrl,
      finalWebUrl: finalUrl
      // Ovdje kasnije dodaš: items: [...], totalPrice: ...
    };

  } catch (error: any) {
    console.error('Greška pri obradi mobilne košarice:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Neuspješno učitavanje mobilne košarice.'
    });
  }
});
