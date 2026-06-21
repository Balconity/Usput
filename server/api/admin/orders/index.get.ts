import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = "Usput";

export default defineEventHandler(async () => {
  // Povlačenje ključeva
  const config = useRuntimeConfig();

  // Eksplicitna inicijalizacija unutar handlera
  const client = new DynamoDBClient({
    region: "eu-central-1",
    credentials: {
      accessKeyId: config.awsAccessKey,
      secretAccessKey: config.awsSecretKey
    }
  });
  const docClient = DynamoDBDocumentClient.from(client);

  try {
    const data = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "begins_with(PK, :prefix)",
      ExpressionAttributeValues: {
        ":prefix": "ORDER#"
      }
    }));

    // Provjera ako neki item nema createdAt da ne sruši sortiranje
    const items = (data.Items || []).sort((a: any, b: any) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return { success: true, orders: items };
  } catch (error: any) {
    console.error("❌ Greška pri dohvaćanju narudžbi iz AWS-a:", error);
    throw createError({ statusCode: 500, statusMessage: 'Greška pri očitavanju baze.' });
  }
});
