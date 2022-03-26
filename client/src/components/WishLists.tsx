import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createWishList, deleteWishlist, getWishLists, patchWishList } from '../api/wishlists-api'
import Auth from '../auth/Auth'
import { Wishlist } from '../types/WishList'

interface WishListsProps {
  auth: Auth
  history: History
}

interface WishListsState {
  wishLists: Wishlist[]
  newWishListName: string
  loadingWishLists: boolean
}

export class WishLists extends React.PureComponent<WishListsProps, WishListsState> {
  state: WishListsState = {
    wishLists: [],
    newWishListName: '',
    loadingWishLists: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newWishListName: event.target.value })
  }

  onEditButtonClick = (wishListId: string) => {
    this.props.history.push(`/wishlists/${wishListId}/edit`)
  }

  onWishListCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newWishList = await createWishList(this.props.auth.getIdToken(), {
        name: this.state.newWishListName,
        dueDate
      })
      this.setState({
        wishLists: [...this.state.wishLists, newWishList],
        newWishListName: ''
      })
    } catch {
      alert('Wish list creation failed')
    }
  }

  onWishListDelete = async (wishListId: string) => {
    try {
      await deleteWishlist(this.props.auth.getIdToken(), wishListId)
      this.setState({
        wishLists: this.state.wishLists.filter(wishList => wishList.wishListId !== wishListId)
      })
    } catch {
      alert('Wish list deletion failed')
    }
  }

  onWishListCheck = async (pos: number) => {
    try {
      const wishList = this.state.wishLists[pos]
      await patchWishList(this.props.auth.getIdToken(), wishList.wishListId, {
        name: wishList.name,
        dueDate: wishList.dueDate,
        done: !wishList.done
      })
      this.setState({
        wishLists: update(this.state.wishLists, {
          [pos]: { done: { $set: !wishList.done } }
        })
      })
    } catch {
      alert('Wish list deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const wishLists = await getWishLists(this.props.auth.getIdToken())
      this.setState({
        wishLists,
        loadingWishLists: false
      })
    } catch (e) {
      let errorMessage = "Failed to fetch wish lists";
      if (e instanceof Error) {
        errorMessage = `Failed to fetch wish lists: ${e.message}`;
      }
      alert(errorMessage);
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Wish Lists</Header>

        {this.renderCreateWishListInput()}

        {this.renderWishLists()}
      </div>
    )
  }

  renderCreateWishListInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New item',
              onClick: this.onWishListCreate
            }}
            fluid
            actionPosition="left"
            placeholder="What do you want...??"
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderWishLists() {
    if (this.state.loadingWishLists) {
      return this.renderLoading()
    }

    return this.renderWishListsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Wish Lists
        </Loader>
      </Grid.Row>
    )
  }

  renderWishListsList() {
    return (
      <Grid padded>
        {this.state.wishLists.map((wishList, pos) => {
          return (
            <Grid.Row key={wishList.wishListId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onWishListCheck(pos)}
                  checked={wishList.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {wishList.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {wishList.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(wishList.wishListId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onWishListDelete(wishList.wishListId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {wishList.attachmentUrl && (
                <Image src={wishList.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
