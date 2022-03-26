import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateWishList } from '../../businessLogic/wishLists'
import { UpdateWishListRequest } from '../../requests/UpdateWishListRequest'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('updateWishList')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing updateWishList event: ', event)

    const wishListId = event.pathParameters.wishListId
    const updatedWishList: UpdateWishListRequest = JSON.parse(event.body)

    const userId = getUserId(event)
    await updateWishList(userId, wishListId, updatedWishList)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({})
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
