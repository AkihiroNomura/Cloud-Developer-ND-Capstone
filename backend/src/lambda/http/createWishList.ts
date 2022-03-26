import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateWishListRequest } from '../../requests/CreateWishListRequest'
import { getUserId } from '../utils';
import { createWishList } from '../../businessLogic/wishLists'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createWishList')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing createWishList event: ', event)

    const newWishList: CreateWishListRequest = JSON.parse(event.body)

    const userId = getUserId(event)
    const wishListItem = await createWishList(userId, newWishList)

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        item: wishListItem,
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
