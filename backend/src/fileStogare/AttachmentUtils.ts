import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('AttachmentUtils')

export class AttachmentUtils {
  constructor (
    private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
    private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
    private readonly urlExp = process.env.SIGNED_URL_EXPIRATION
  ) {}

  getUploadUrl = (attachmentId: string): string => {
    logger.info('Getting upload url.')

    return this.s3.getSignedUrl('putObject', {
        Bucket: this.bucketName,
        Key: attachmentId,
        Expires: parseInt(this.urlExp)
    })
  }

  getAttachmentUrl = (attachmentId: string): string => {
    logger.info('Getting attachment url.')

    return `https://${this.bucketName}.s3.amazonaws.com/${attachmentId}`
  }
}