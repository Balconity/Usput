import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'

const TABLE_NAME = "Usput"

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const method = getMethod(event)

  const client = new DynamoDBClient({
    region: 'eu-central-1',
    credentials: {
      accessKeyId: config.awsAccessKey,
      secretAccessKey: config.awsSecretKey
    }
  })
  const docClient = DynamoDBDocumentClient.from(client)

  if (method === 'GET') {
    try {
      const response = await docClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: 'SETTINGS', SK: 'PRICING' }
      }))
      return { success: true, data: response.Item?.data || null }
    } catch (error) {
      console.error('Greška pri dohvaćanju cijena:', error)
      throw createError({ statusCode: 500, statusMessage: 'Ne mogu dohvatiti podatke o cijenama.' })
    }
  }

  if (method === 'POST') {
    try {
      const body = await readBody(event)
      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: 'SETTINGS',
          SK: 'PRICING',
          data: body,
          updatedAt: new Date().toISOString()
        }
      }))
      return { success: true }
    } catch (error) {
      console.error('Greška pri spremanju cijena:', error)
      throw createError({ statusCode: 500, statusMessage: 'Ne mogu spremiti podatke o cijenama.' })
    }
  }
})
