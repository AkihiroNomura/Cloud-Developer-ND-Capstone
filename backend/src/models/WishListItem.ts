export interface WishListItem {
  userId: string
  wishListId: string
  createdAt: string
  name: string
  dueDate: string
  done: boolean
  url?: string
  phoneNumber?: string
  attachmentUrl?: string
}
