import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import nodemailer from "nodemailer";

const TABLE_NAME = "Usput";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

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

    const trackingUrl = `https://usput.hr/delivery/${orderId}`;
    const adminUrl = `https://usput.hr/admin/${orderId}`;

    const formattedPrice = Number(orderData.transport.price).toFixed(2).replace('.', ',');
    const formattedDate = new Date(orderData.delivery.date).toLocaleDateString('hr-HR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    // 1. SPREMANJE U BAZU
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

    // 2. PRIPREMA E-MAIL SUSTAVA
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: Number(config.smtpPort) || 465,
      secure: true,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });

    // 3. POZIVANJE HTML PREDLOŽAKA IZ 'server/utils'
    const customerMailOptions = {
      from: `"Usput Dostava" <${config.smtpUser}>`,
      to: orderData.personalInfo.email,
      subject: `Potvrda zahtjeva za dostavu: ${orderId}`,
      html: getCustomerEmailHtml(orderData, orderId, formattedDate, formattedPrice, trackingUrl)
    };

    const adminMailOptions = {
      from: `"Usput Sustav" <${config.smtpUser}>`,
      to: config.smtpUser,
      subject: `✅ NOVA NARUDŽBA: ${orderData.delivery.city} (${formattedPrice} €)`,
      html: getAdminEmailHtml(orderData, orderId, formattedPrice, adminUrl)
    };

    // 4. SLANJE MAILOVA
    try {
      await Promise.all([
        transporter.sendMail(customerMailOptions),
        transporter.sendMail(adminMailOptions)
      ]);
    } catch (err) {
      console.error('Baza je uspješno spremljena, ali je došlo do greške pri slanju mailova:', err);
    }

    return { success: true, orderId: orderId };

  } catch (error: any) {
    console.error('Greška pri spremanju narudžbe:', error);
    throw createError({ statusCode: 500, statusMessage: 'Ne mogu spremiti narudžbu.' });
  }
});
