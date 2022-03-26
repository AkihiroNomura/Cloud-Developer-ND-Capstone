import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl, updateAttachmentUrl } from '../../businessLogic/wishLists'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('generateUploadUrl')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing generateUploadUrl event: ', event)

    const wishListId = event.pathParameters.wishListId

    const userId = getUserId(event)
    const uploadUrl = createAttachmentPresignedUrl(wishListId)
    const attachmentUrl = uploadUrl.split("?")[0]

    await updateAttachmentUrl(userId, wishListId, attachmentUrl)

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        uploadUrl,
      })
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
