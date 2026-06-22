import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'

const TABLE_NAME = "Usput"

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const orderId = getRouterParam(event, 'id')

  if (!orderId) {
    throw createError({ statusCode: 400, statusMessage: 'Nedostaje ID narudžbe' })
  }

  const body = await readBody(event)
  const { lockerLocation, lockerPin } = body

  if (!lockerLocation || !lockerPin) {
    throw createError({ statusCode: 400, statusMessage: 'Lokacija paketomata i PIN su obavezni.' })
  }

  const client = new DynamoDBClient({
    region: 'eu-central-1',
    credentials: {
      accessKeyId: config.awsAccessKey,
      secretAccessKey: config.awsSecretKey
    }
  })
  const docClient = DynamoDBDocumentClient.from(client)

  try {
    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `ORDER#${orderId}`,
        SK: 'DETAILS'
      },
      UpdateExpression: 'set ikeaDetails.lockerLocation = :loc, ikeaDetails.lockerPin = :pin',
      ExpressionAttributeValues: {
        ':loc': lockerLocation,
        ':pin': lockerPin
      },
      ReturnValues: 'ALL_NEW'
    })

    await docClient.send(command)
    return { success: true }
  } catch (error) {
    console.error('Greška pri spremanju PIN-a:', error)
    throw createError({ statusCode: 500, statusMessage: 'Spremanje nije uspjelo.' })
  }
})
