import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import nodemailer from "nodemailer";

const client = new DynamoDBClient({ region: "eu-central-1" });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = "Usput";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  try {
    const orderData = await readBody(event);
    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 1. KORAK: TESTIRANJE BAZE
    try {
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
    } catch (dbError: any) {
      // Ako padne ovdje, vraćamo točan razlog iz baze!
      return {
        success: false,
        gdjeJePalo: "DYNAMODB_BAZA",
        poruka: dbError.message,
        kod: dbError.name
      };
    }

    // 2. KORAK: TESTIRANJE MAILA
    try {
      const transporter = nodemailer.createTransport({
        host: config.smtpHost || process.env.SMTP_HOST,
        port: Number(config.smtpPort || process.env.SMTP_PORT) || 465,
        secure: true,
        auth: {
          user: config.smtpUser || process.env.SMTP_USER,
          pass: config.smtpPass || process.env.SMTP_PASS,
        },
      });

      const customerMailOptions = {
        from: `"Usput Dostava" <${config.smtpUser || process.env.SMTP_USER}>`,
        to: orderData.personalInfo.email,
        subject: `Potvrda narudžbe: ${orderId}`,
        html: `<p>Test narudžba.</p>`
      };

      await transporter.sendMail(customerMailOptions);

    } catch (mailError: any) {
      // Ako baza prođe, ali mail padne, znat ćemo!
      return {
        success: false,
        gdjeJePalo: "NODEMAILER_MAIL",
        poruka: mailError.message
      };
    }

    return { success: true, orderId: orderId };

  } catch (error: any) {
    return { success: false, gdjeJePalo: "GLAVNI_CATCH", poruka: error.message };
  }
});
