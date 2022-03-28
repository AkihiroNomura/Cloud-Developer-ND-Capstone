import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('SendNotification')

export class SendNotification {
  constructor(
    private readonly snsClient = createSnsClient(),
  ) {}

  sendTxtNotification = async (phoneNumber: string, message: string, subject: string) => {
    logger.info('Send notidication')
    const publishParams = {
      Message: message,
      Subject: subject,
      PhoneNumber: phoneNumber
    }
    await this.snsClient.publish(publishParams).promise()
  }
}

const createSnsClient = () => {
  if (process.env.IS_OFFLINE) {
    console.log('SNS Topic is not necessary.')
    return;
  }
  return new XAWS.SNS({ apiVersion: '2012-10-17'})
}