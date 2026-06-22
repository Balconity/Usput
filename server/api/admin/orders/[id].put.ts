import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

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

  const id = getRouterParam(event, 'id');
  const body = await readBody(event);

  if (!body.status) {
    throw createError({ statusCode: 400, statusMessage: 'Novi status je obavezan.' });
  }

  try {
    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `ORDER#${id}`,
        SK: 'DETAILS'
      },
      UpdateExpression: "SET #status = :newStatus",
      ExpressionAttributeNames: {
        "#status": "status"
      },
      ExpressionAttributeValues: {
        ":newStatus": body.status
      }
    }));

    return { success: true, message: `Status uspješno promijenjen u ${body.status}` };
  } catch (error) {
    console.error("Greška pri ažuriranju statusa:", error);
    throw createError({ statusCode: 500, statusMessage: 'Greška pri očitavanju baze.' });
  }
});
