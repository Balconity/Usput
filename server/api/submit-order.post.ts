import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import nodemailer from "nodemailer";

const TABLE_NAME = "Usput";

export default defineEventHandler(async (event) => {
  // 1. Povlačenje varijabli iz nuxt.config
  const config = useRuntimeConfig();

  // 2. Inicijalizacija baze pomoću eksplicitno definiranih ključeva iz konfiguracije
  const client = new DynamoDBClient({
    region: "eu-central-1",
    credentials: {
      accessKeyId: config.awsAccessKey,
      secretAccessKey: config.awsSecretKey
    }
  });
  const docClient = DynamoDBDocumentClient.from(client);

  try {
    const orderData = await readBody(event);
    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 3. SPREMANJE U BAZU
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `ORDER#${orderId}`,
        SK: 'DETAILS',
        createdAt: new Date().toISOString(),
        status: 'NOVO',
        ...orderData
      }
    }));

    // 4. PRIPREMA E-MAIL SUSTAVA
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: Number(config.smtpPort) || 465,
      secure: true,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });

    // 5. E-MAIL ZA KUPCA (Potvrda)
    const customerMailOptions = {
      from: `"Usput Dostava" <${config.smtpUser}>`,
      to: orderData.personalInfo.email,
      subject: `Potvrda zahtjeva za dostavu: ${orderId}`,
      html: `
        <div style="font-family: sans-serif; max-w-2xl; margin: 0 auto; color: #333;">
          <h2 style="color: #0058a3;">Poštovani/a ${orderData.personalInfo.name},</h2>
          <p>Uspješno smo zaprimili Vaš zahtjev za dostavu iz IKEA-e.</p>

          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Detalji isporuke:</h3>
            <ul style="list-style-type: none; padding-left: 0;">
              <li><strong>Broj narudžbe:</strong> ${orderId}</li>
              <li><strong>Adresa:</strong> ${orderData.delivery.street}, ${orderData.delivery.zip} ${orderData.delivery.city}</li>
              <li><strong>Planirani datum:</strong> ${new Date(orderData.delivery.date).toLocaleDateString('hr-HR')}</li>
              <li><strong>Ukupno za naplatu:</strong> <span style="font-size: 18px; font-weight: bold;">${orderData.transport.price} €</span></li>
            </ul>
          </div>

          <p>Naš tim će uskoro pregledati Vaš zahtjev. Vozač će Vas kontaktirati prije samog dolaska na adresu.</p>
          <p>Ukoliko imate bilo kakvih pitanja, slobodno odgovorite na ovaj e-mail.</p>
          <br>
          <p>Srdačan pozdrav,<br><strong>Vaš Usput Tim</strong></p>
        </div>
      `
    };

    // 6. E-MAIL ZA TEBE (Admin obavijest s tvojom domenom)
    const adminMailOptions = {
      from: `"Usput Sustav" <${config.smtpUser}>`,
      to: config.smtpUser,
      subject: `🚨 NOVA NARUDŽBA: ${orderData.delivery.city} (${orderData.transport.price} €)`,
      html: `
        <div style="font-family: sans-serif; max-w-2xl; margin: 0 auto; color: #333;">
          <h2 style="color: #d97706;">Novi zahtjev za dostavu je zaprimljen!</h2>
          <div style="background-color: #fffbeb; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <p style="margin-top: 0;"><strong>Kupac:</strong> ${orderData.personalInfo.name}</p>
            <p><strong>Kontakt:</strong> <a href="tel:${orderData.personalInfo.phone}">${orderData.personalInfo.phone}</a></p>
            <p><strong>Grad isporuke:</strong> ${orderData.delivery.city}</p>
            <p style="margin-bottom: 0;"><strong>Za naplatu:</strong> <span style="font-size: 20px; font-weight: bold; color: #b45309;">${orderData.transport.price} €</span></p>
          </div>
          <a href="https://main.d3jhqcxxjwpkoo.amplifyapp.com/admin/${orderId}" style="display: inline-block; background-color: #111827; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Otvori narudžbu u sustavu</a>
        </div>
      `
    };

    // 7. SLANJE MAILOVA U POZADINI
    Promise.all([
      transporter.sendMail(customerMailOptions),
      transporter.sendMail(adminMailOptions)
    ]).catch(err => {
      console.error('Baza je uspješno spremljena, ali je došlo do greške pri slanju mailova:', err);
    });

    return { success: true, orderId: orderId };

  } catch (error: any) {
    console.error('Greška pri spremanju narudžbe:', error);
    throw createError({ statusCode: 500, statusMessage: 'Ne mogu spremiti narudžbu.' });
  }
});
