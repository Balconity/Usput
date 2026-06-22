import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'

// ISPRAVLJENO: Točno ime tvoje DynamoDB tablice
const TABLE_NAME = "Usput";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // ISPRAVLJENO: Nuxt način za čitanje GET/POST metode
  const method = getMethod(event)

  // Inicijalizacija baze s tvojim ključevima
  const client = new DynamoDBClient({
    region: 'eu-central-1',
    credentials: {
      accessKeyId: config.awsAccessKey,
      secretAccessKey: config.awsSecretKey
    }
  })
  const docClient = DynamoDBDocumentClient.from(client)

  // 1. GET METODA - Čitanje podataka o vozilu pri učitavanju dashboarda
  if (method === 'GET') {
    try {
      const response = await docClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: 'SETTINGS',
          SK: 'VEHICLE'
        }
      }))
      return { success: true, data: response.Item?.data || null }
    } catch (error) {
      console.error('Greška pri dohvaćanju vozila iz DynamoDB:', error)
      throw createError({ statusCode: 500, statusMessage: 'Ne mogu dohvatiti podatke o vozilu.' })
    }
  }

  // 2. POST METODA - Spremanje dimenzija vozila u bazu
  if (method === 'POST') {
    try {
      const body = await readBody(event)

      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: 'SETTINGS',
          SK: 'VEHICLE',
          data: body,
          updatedAt: new Date().toISOString()
        }
      }))

      return { success: true }
    } catch (error) {
      console.error('Greška pri spremanju vozila u DynamoDB:', error)
      throw createError({ statusCode: 500, statusMessage: 'Ne mogu spremiti podatke o vozilu u bazu.' })
    }
  }
})
