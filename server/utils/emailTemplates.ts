// server/utils/emailTemplates.ts

export function getCustomerEmailHtml(data: any, orderId: string, formattedDate: string, formattedPrice: string, trackingUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="background-color: #f9fafb; padding: 20px 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <div style="max-w-600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #f3f4f6;">

        <div style="background-color: #111827; padding: 30px 20px; text-align: center;">
          <h1 style="color: #facc15; margin: 0; font-size: 28px; letter-spacing: 1.5px; text-transform: uppercase;">USPUT</h1>
          <p style="color: #9ca3af; margin: 8px 0 0 0; font-size: 14px;">Vaša dostava je u sigurnim rukama</p>
        </div>

        <div style="padding: 32px 24px;">
          <h2 style="color: #111827; margin-top: 0; font-size: 20px;">Poštovani/a ${data.personalInfo.name},</h2>
          <p style="color: #4b5563; line-height: 1.6; font-size: 15px;">Uspješno smo zaprimili Vaš zahtjev za dostavu IKEA paketa. Vaš termin je rezerviran i trenutno ga pripremamo za obradu.</p>

          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin: 28px 0;">
            <h3 style="color: #111827; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 16px 0; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">Pregled narudžbe</h3>

            <table width="100%" cellpadding="0" cellspacing="0" style="color: #4b5563; font-size: 14px; line-height: 1.8;">
              <tr>
                <td style="padding: 4px 0; color: #6b7280;">ID Narudžbe:</td>
                <td style="padding: 4px 0; text-align: right; font-family: monospace; font-weight: bold; color: #111827;">${orderId}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #6b7280;">Termin dostave:</td>
                <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #111827;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #6b7280; vertical-align: top;">Adresa:</td>
                <td style="padding: 4px 0; text-align: right; font-weight: 500; color: #111827;">${data.delivery.street}<br>${data.delivery.zip} ${data.delivery.city}</td>
              </tr>
              ${data.transport.disposalRequested && data.transport.disposalItemsCount > 0 ? `
              <tr>
                <td style="padding: 8px 0 4px 0; color: #2563eb; font-weight: bold;">Dodatna usluga:</td>
                <td style="padding: 8px 0 4px 0; text-align: right; color: #2563eb; font-weight: bold;">Odvoz starog namještaja (${data.transport.disposalItemsCount} kom)</td>
              </tr>` : ''}
            </table>

            <div style="border-top: 2px dashed #e5e7eb; margin-top: 20px; padding-top: 20px; text-align: right;">
              <span style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Ukupno za naplatu pri preuzimanju</span><br>
              <span style="font-size: 32px; font-weight: 900; color: #111827; line-height: 1.2;">${formattedPrice} €</span>
            </div>
          </div>

          <div style="text-align: center; margin: 36px 0;">
            <a href="${trackingUrl}" style="display: inline-block; background-color: #facc15; color: #111827; font-weight: bold; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; transition: background-color 0.2s;">Pratite status Vaše dostave</a>
            <p style="color: #6b7280; font-size: 13px; margin-top: 14px;">Preko ove poveznice možete u svakom trenutku vidjeti u kojoj je fazi Vaša narudžba.</p>
          </div>

          <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">Naš vozač će Vas kontaktirati prije samog dolaska na adresu kako biste se točno dogovorili o vremenu isporuke.</p>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-bottom: 0;">Ako imate bilo kakvih pitanja ili trebate izmijeniti podatke, slobodno odgovorite na ovaj e-mail.</p>
        </div>

        <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">Ova poruka je automatski generirana, ali naš tim osobno čita Vaše odgovore.</p>
          <p style="color: #9ca3af; font-size: 12px; margin: 6px 0 0 0; font-weight: bold;">Usput Dostava, Varaždin</p>
        </div>

      </div>
    </body>
    </html>
  `;
}

export function getAdminEmailHtml(data: any, orderId: string, formattedPrice: string, adminUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="background-color: #f3f4f6; padding: 20px 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-w-500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border-top: 6px solid #10b981; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">

        <div style="padding: 24px;">
          <div style="display: inline-block; background-color: #d1fae5; color: #047857; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: bold; letter-spacing: 1px; margin-bottom: 16px;">NOVA NARUDŽBA</div>

          <h2 style="margin: 0 0 8px 0; color: #111827; font-size: 24px;">${data.delivery.city}</h2>
          <p style="margin: 0 0 24px 0; color: #10b981; font-size: 20px; font-weight: black;">+${formattedPrice} €</p>

          <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; border: 1px solid #e5e7eb;">
            <table width="100%" cellpadding="0" cellspacing="0" style="color: #374151; font-size: 14px; line-height: 1.6;">
              <tr><td width="35%" style="padding: 6px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Kupac:</td><td style="padding: 6px 0; font-weight: bold; color: #111827;">${data.personalInfo.name}</td></tr>
              <tr><td style="padding: 6px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Telefon:</td><td style="padding: 6px 0;"><a href="tel:${data.personalInfo.phone}" style="color: #2563eb; font-weight: bold; text-decoration: none;">${data.personalInfo.phone}</a></td></tr>
              <tr><td style="padding: 6px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; vertical-align: top;">Adresa:</td><td style="padding: 6px 0; font-weight: 500;">${data.delivery.street}<br>${data.delivery.zip} ${data.delivery.city}</td></tr>
              <tr><td style="padding: 6px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Usluga:</td><td style="padding: 6px 0; font-weight: bold;">${data.delivery.option === 'room' ? 'Unos u prostoriju' : 'Do kolnog prilaza'}</td></tr>

              ${data.transport.disposalRequested && data.transport.disposalItemsCount > 0 ? `
              <tr><td style="padding: 6px 0; color: #ef4444; font-size: 12px; text-transform: uppercase; font-weight: bold;">Odvoz:</td><td style="padding: 6px 0; color: #ef4444; font-weight: bold;">DA (${data.transport.disposalItemsCount} kom)</td></tr>` : ''}
            </table>
          </div>

          <div style="margin-top: 24px;">
            <a href="${adminUrl}" style="display: block; background-color: #111827; color: #ffffff; text-align: center; padding: 16px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Otvori narudžbu u sustavu</a>
          </div>

          <p style="text-align: center; color: #9ca3af; font-size: 11px; margin-top: 20px;">ID: ${orderId}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
