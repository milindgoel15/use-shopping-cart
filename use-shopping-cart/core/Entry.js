import { formatCurrencyString } from '../utilities/old-utils'

export function updateFormattedTotalPrice(state) {
  state.formattedTotalPrice = formatCurrencyString({
    value: state.totalPrice,
    currency: state.currency,
    language: state.language
  })
}

export function updateFormattedValue(state, id) {
  state.cartDetails[id].formattedValue = formatCurrencyString({
    value: state.cartDetails[id].value,
    currency: state.currency,
    language: state.language
  })
}

function Entry({
  state,
  id,
  product,
  quantity,
  price_metadata,
  product_metadata
}) {
  quantity = parseInt(quantity, 10)
  return {
    ...product,
    id,
    quantity,
    value: product.price * quantity,
    price_data: {
      ...product.price_data,
      ...price_metadata
    },
    product_data: {
      ...product.product_data,
      ...product_metadata
    }
  }
}

export function createEntry({
  state,
  id,
  product,
  count,
  price_metadata,
  product_metadata
}) {
  const entry = Entry({
    state,
    id,
    product,
    quantity: count,
    price_metadata,
    product_metadata
  })

  state.cartDetails[id] = entry
  updateFormattedValue(state, id)

  state.totalPrice += entry.value
  state.cartCount += count
  updateFormattedTotalPrice(state)
}

export function updateEntry({
  state,
  id,
  count,
  price_metadata,
  product_metadata
}) {
  count = parseInt(count, 10)
  const entry = state.cartDetails[id]
  if (entry.quantity + count <= 0) return removeEntry({ state, id })

  state.cartDetails[id] = Entry({
    state,
    product: entry,
    quantity: entry.quantity + count,
    price_metadata,
    product_metadata
  })
  updateFormattedValue(state, id)

  state.totalPrice += entry.price * count
  state.cartCount += count
  updateFormattedTotalPrice(state)
}

export function removeEntry({ state, id }) {
  const cartDetails = state.cartDetails
  state.totalPrice -= cartDetails[id].value
  state.cartCount -= cartDetails[id].quantity
  delete cartDetails[id]
  updateFormattedTotalPrice(state)
}

export function updateQuantity({ state, id, quantity }) {
  quantity = parseInt(quantity, 10)
  const entry = state.cartDetails[id]
  updateEntry({
    state,
    id,
    count: quantity - entry.quantity
  })
}
