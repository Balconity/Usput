import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb'

const TABLE_NAME = "Usput"

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const client = new DynamoDBClient({
    region: 'eu-central-1',
    credentials: {
      accessKeyId: config.awsAccessKey,
      secretAccessKey: config.awsSecretKey
    }
  })
  const docClient = DynamoDBDocumentClient.from(client)

  try {
    // Skeniramo tablicu kako bismo zbrojili volumene narudžbi
    const response = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME
    }))

    const items = response.Items || []
    const occupancy: Record<string, number> = {}

    // Grupiramo i zbrajamo volumen isključivo aktivnih narudžbi
    items.forEach((item: any) => {
      if (item.PK?.startsWith('ORDER#') && item.status !== 'OTKAZANO' && item.delivery?.date) {
        const dateStr = item.delivery.date.split('T')[0] // Dobivamo YYYY-MM-DD
        const vol = item.transport?.totalVolume || 0

        occupancy[dateStr] = (occupancy[dateStr] || 0) + vol
      }
    })

    // Vraćamo samo čistu mapu datuma i zauzetih kubika (100% sigurno za javnost)
    return { success: true, occupancy }
  } catch (error) {
    console.error('Greška pri računanju zauzeća termina:', error)
    return { success: false, occupancy: {} }
  }
})
