import { WishListsAccess } from '../dataLayer/wishListsAcess'
import { AttachmentUtils } from '../fileStogare/AttachmentUtils'
import { SendNotification } from '../SNS/sendNotification';
import { WishListItem } from '../models/WishListItem'
import { CreateWishListRequest } from '../requests/CreateWishListRequest'
import { UpdateWishListRequest } from '../requests/UpdateWishListRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'

const logger = createLogger('wishLists')

const wishListsAccess = new WishListsAccess()
const attachmentUtils = new AttachmentUtils()
const sendNotification = new SendNotification()

export const getWishListsForUser = async (userId: string): Promise<WishListItem[]> => {
  return await wishListsAccess.getWishLists(userId)
}

export const getWishListForUser = async (userId: string, wishListId: string): Promise<WishListItem> => {
  return await wishListsAccess.getWishList(userId, wishListId)
}

export const createWishList = async (userId: string, newWishList: CreateWishListRequest): Promise<WishListItem> => {
  const wishListId = uuid.v4()

  return await wishListsAccess.createWishList({
    userId,
    wishListId,
    createdAt: new Date().toISOString(),
    name: newWishList.name,
    dueDate: newWishList.dueDate,
    done: false,
    url: newWishList.url,
    phoneNumber: newWishList.phoneNumber
  })
}

export const updateWishList = async (userId: string, wishListId: string, updateWishList: UpdateWishListRequest) => {
  await wishListsAccess.updateWishList(userId, wishListId, updateWishList)
}

export const deleteWishList = async (userId: string, wishListId: string) => {
  await wishListsAccess.deleteWishList(userId, wishListId)
}

export const updateAttachmentUrl = async (userId: string, wishListId: string, attachmentUrl: string) => {
  const item = await wishListsAccess.getWishList(userId, wishListId)

  if (item.userId !== userId) {
    logger.error(`User ${userId} does not have permission.`)
    throw new Error(`User ${userId} does not have permission`)
  }

  await wishListsAccess.updateAttachmentUrl(wishListId, userId, attachmentUrl)
}

export const createAttachmentPresignedUrl = (attachmentId: string) => {
  return attachmentUtils.getUploadUrl(attachmentId)
}

export const getAttachmentUrl = (attachmentId: string) => {
  return attachmentUtils.getAttachmentUrl(attachmentId)
}

export const sendTxtNotification = async (phoneNumber: string, message: string, subject: string) => {
  await sendNotification.sendTxtNotification(phoneNumber, message, subject)
}