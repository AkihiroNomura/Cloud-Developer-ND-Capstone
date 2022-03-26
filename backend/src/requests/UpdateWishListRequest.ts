/**
 * Fields in a request to update a single TODO item.
 */
export interface UpdateWishListRequest {
  name: string
  dueDate: string
  done: boolean
}