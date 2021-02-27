import { createSlice } from '@reduxjs/toolkit'
import { createEntry, updateEntry, removeEntry, updateQuantity } from './Entry'
import { isClient } from '../utilities/SSR'

export const initialState = {
  mode: 'checkout-session',
  stripe: null,
  currency: 'USD',
  language: isClient ? navigator.language : 'en-US',
  lastClicked: '',
  shouldDisplayCart: false,
  cartCount: 0,
  totalPrice: 0,
  cartDetails: {}
}

const slice = createSlice({
  name: 'cart',
  initialState: initialState,
  reducers: {
    addItem: {
      reducer: (state, { payload }) => {
        const {
          product,
          options: { count, price_metadata, product_metadata }
        } = payload

        if (count <= 0) return

        if (payload?.id in state.cartDetails) {
          return updateEntry({
            id: payload.id,
            count,
            price_metadata,
            product_metadata,
            currency: state.currency,
            language: state.language
          })
        }

        return createEntry({
          ...state,
          state,
          product,
          count,
          price_metadata,
          product_metadata,
          currency: state.currency,
          language: state.language
        })
      },
      prepare: (product, options = { count: 1 }) => {
        if (!options.price_metadata) options.price_metadata = {}

        if (!options.product_metadata) options.product_metadata = {}

        return { payload: { product, options } }
      }
    },
    incrementItem: {
      reducer: (state, { payload }) => {
        const {
          id,
          options: { count }
        } = payload

        return updateQuantity({ state, id, quantity: count })
      },
      prepare: (id, options = { count: 1 }) => {
        return { payload: { id, options } }
      }
    },
    decrementItem: {
      reducer: (state, { payload }) => {
        const {
          id,
          options: { count }
        } = payload

        return updateQuantity({ state, id, quantity: -count })
      },
      prepare: (id, options = { count: 1 }) => {
        return { payload: { id, options } }
      }
    },
    clearCart: {
      reducer: (state) => {
        state.cartCount = 0
        state.totalPrice = 0
        state.cart = {}
      }
    },
    setItemQuantity: {
      reducer: (state, { payload }) => {
        const { id, quantity } = payload
        if (quantity < 0) return

        if (id in state.cartDetails)
          return updateQuantity({ ...state, state, id, quantity })
      },
      prepare: (id, quantity = 1) => {
        return { payload: { id, quantity } }
      }
    },
    removeItem: {
      reducer: (state, { payload }) => {
        return removeEntry({ state, id: payload })
      }
    }
  }
})

export const { reducer, actions } = slice
