import nodemailer from "nodemailer";

export default defineEventHandler(async (event) => {
  // Dohvaćamo iste postavke koje koristiš za narudžbe
  const config = useRuntimeConfig();

  try {
    const body = await readBody(event);
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      throw createError({ statusCode: 400, statusMessage: 'Nedostaju obavezna polja.' });
    }

    // 1. PRIPREMA E-MAIL SUSTAVA
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: Number(config.smtpPort) || 465,
      secure: true,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });

    // 2. PRIPREMA HTML PREDLOŠKA ZA TEBE (ADMINA)
    const adminMailOptions = {
      from: `"Usput Kontakt Forma" <${config.smtpUser}>`,
      to: config.smtpUser, // Šalje se na tvoj admin e-mail
      replyTo: email, // Omogućava ti da samo stisneš "Reply" na primljeni mail
      subject: `Novi upit: ${subject} (${name})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #1f2937;">
          <h2 style="color: #111827; border-bottom: 3px solid #facc15; padding-bottom: 10px; margin-bottom: 20px;">
            Novi upit s kontakt forme
          </h2>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Ime i prezime:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>E-mail:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><a href="mailto:${email}" style="color: #0057AD;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Broj telefona:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${phone || 'Nije upisano'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Tema upita:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${subject}</td>
            </tr>
          </table>

          <h3 style="color: #374151; margin-top: 30px;">Poruka:</h3>
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; white-space: pre-wrap; font-size: 15px; line-height: 1.6;">${message}</div>

          <p style="margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center;">
            Ova poruka je automatski generirana s web stranice usput.hr. Za odgovor klijentu, samo kliknite "Odgovori".
          </p>
        </div>
      `
    };

    // 3. SLANJE MAILA
    await transporter.sendMail(adminMailOptions);

    return { success: true, message: 'Email je uspješno poslan.' };

  } catch (error: any) {
    console.error('Greška pri slanju kontakt forme:', error);
    throw createError({ statusCode: 500, statusMessage: 'Sustav ne može poslati e-mail.' });
  }
});
