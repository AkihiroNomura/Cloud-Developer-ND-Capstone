import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { WishListItem } from '../models/WishListItem'
import { WishListUpdate } from '../models/WishListUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('WishListsAccess')

export class WishListsAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly wishListsTable = process.env.WISHLISTS_TABLE,
    private readonly wishListsTableIndex = process.env.WISHLISTS_CREATED_AT_INDEX
  ) {}

  getWishLists = async (userId: string): Promise<WishListItem[]> => {
    logger.info(`Getting all wish list items for ${userId}.`)

    const result = await this.docClient.query({
      TableName: this.wishListsTable,
      IndexName: this.wishListsTableIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
      ':userId': userId
      },
      ScanIndexForward: false
    }).promise()

    return result.Items as WishListItem[]
  }

  getWishList = async (userId: string, wishListId: string): Promise<WishListItem> => {
    logger.info(`Getting wish list item ${wishListId} for ${userId}.`)

    const result = await this.docClient.get({
      TableName: this.wishListsTable,
      Key: {
        userId,
        wishListId
      }
    }).promise()

    return result.Item as WishListItem
  }

  createWishList = async (newWishList: WishListItem): Promise<WishListItem> => {
    logger.info(`Creating wish list item ${newWishList}.`)

    await this.docClient.put({
      TableName: this.wishListsTable,
      Item: newWishList
    }).promise()

    return newWishList
  }

  updateWishList = async (userId: string, wishListId: string, updatedWishList: WishListUpdate): Promise<void> => {
    logger.info(`Updating wish list item ${wishListId}.`)

    await this.docClient.update({
      TableName: this.wishListsTable,
      Key: {
          wishListId,
          userId
      },
      UpdateExpression:
        'set #name = :name, #dueDate = :dueDate, #done = :done',
      ExpressionAttributeNames: {
        '#name': 'name',
        '#dueDate': 'dueDate',
        '#done': 'done'
      },
      ExpressionAttributeValues: {
        ':name': updatedWishList.name,
        ':dueDate': updatedWishList.dueDate,
        ':done': updatedWishList.done
      }
    }).promise()
  }

  deleteWishList = async (userId: string, wishListId: string): Promise<void> => {
    logger.info(`Deleting wish list item ${wishListId}.`)

    await this.docClient.delete({
      TableName: this.wishListsTable,
      Key: {
        wishListId,
        userId
      }
    }).promise()
  }

  updateAttachmentUrl = async (wishListId: string, userId: string, attachmentUrl: string): Promise<void> => {
    logger.info(`Updating attachment url ${attachmentUrl}.`)

    await this.docClient.update({
        TableName: this.wishListsTable,
        Key: { userId, wishListId },
        UpdateExpression: "set attachmentUrl = :attachmentUrl",
        ExpressionAttributeValues: {
          ":attachmentUrl": attachmentUrl
      },
      ReturnValues: "UPDATED_NEW"
    }).promise();
  }
}

const createDynamoDBClient = () => {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
    })
  }
  return new XAWS.DynamoDB.DocumentClient()
}