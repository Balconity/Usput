import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = "Usput";

export default defineEventHandler(async (event) => {
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

  const id = getRouterParam(event, 'id');

  try {
    const data = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `ORDER#${id}`,
        SK: 'DETAILS'
      }
    }));

    if (!data.Item) {
      throw createError({ statusCode: 404, statusMessage: 'Narudžba nije pronađena.' });
    }

    return { success: true, order: data.Item };
  } catch (error) {
    console.error("Greška pri dohvaćanju narudžbe:", error);
    throw createError({ statusCode: 500, statusMessage: 'Greška pri očitavanju baze.' });
  }
});
