import { apiEndpoint } from '../config'
import { Wishlist } from '../types/WishList';
import { CreateWishListRequest } from '../types/CreateWishListRequest';
import Axios from 'axios'
import { UpdateWishListRequest } from '../types/UpdateWishListRequest';

export async function getWishLists(idToken: string): Promise<Wishlist[]> {
  console.log('Fetching wish lists')

  const response = await Axios.get(`${apiEndpoint}/wishlists`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Wish Lists:', response.data)
  return response.data.items
}

export async function createWishList(
  idToken: string,
  newWishList: CreateWishListRequest
): Promise<Wishlist> {
  console.log('createWishList: ', newWishList)

  const response = await Axios.post(`${apiEndpoint}/wishlists`,  JSON.stringify(newWishList), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchWishList(
  idToken: string,
  wishListId: string,
  updatedWishlist: UpdateWishListRequest
): Promise<void> {
  console.log('patchWishList: ', updatedWishlist)
  await Axios.patch(`${apiEndpoint}/wishlists/${wishListId}`, JSON.stringify(updatedWishlist), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteWishlist(
  idToken: string,
  wishListId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/wishlists/${wishListId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  wishListId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/wishlists/${wishListId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
