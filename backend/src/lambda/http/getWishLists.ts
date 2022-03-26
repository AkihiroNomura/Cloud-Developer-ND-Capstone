import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getWishListsForUser } from '../../businessLogic/wishLists'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('getWishLists')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing getWishLists event: ', event)

    const userId = getUserId(event)
    const wishLists = await getWishListsForUser(userId)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        items: wishLists
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
