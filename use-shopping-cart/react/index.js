import * as React from 'react'
import { actions, initialState } from '../core/slice'
import { createShoppingCartStore } from '../core/store'
import { createDispatchHook, createSelectorHook, Provider } from 'react-redux'
import { checkoutHandler, filterCart } from '../utilities/old-utils'

export { actions, filterCart }
export const CartContext = React.createContext(initialState)
export const useSelector = createSelectorHook(CartContext)
export const useDispatch = createDispatchHook(CartContext)

export function CartProvider({ children, ...props }) {
  const store = React.useMemo(() => createShoppingCartStore(props), [props])

  React.useEffect(() => {
    // TODO: Add action and reducer in cart slice for stripe changing. Then, make this use the action creator function.
    store.dispatch({ type: 'stripe-changed', payload: props.stripe })
  }, [props.stripe])

  return <Provider value={store}>{children}</Provider>
}

export function useShoppingCart(selector = (state) => ({}), equalityFn) {
  const dispatch = useDispatch()
  const cartState = useSelector(selector, equalityFn)

  // Add checkout options
  // TODO: Checkout options should be integrated into the "core" of this library so that they can be used without a framework or with other frameworks.
  cartState.redirectToCheckout = checkoutHandler(cartState, {
    modes: ['client-only', 'checkout-session'],
    stripe(stripe, options) {
      return stripe.redirectToCheckout(options)
    }
  })
  cartState.checkoutSingleItem = checkoutHandler(cartState, {
    modes: ['client-only'],
    stripe(stripe, options, { sku, quantity = 1 }) {
      options.lineItems = [{ price: sku, quantity }]
      return stripe.redirectToCheckout(options)
    }
  })

  // Add action dispatchors
  for (const key in actions)
    cartState[key] = (...args) => dispatch(actions[key](...args))

  React.useDebugValue(cartState)
  return cartState
}

export function DebugCart(props) {
  const cart = useShoppingCart((state) => state)
  const cartPropertyRows = Object.entries(cart)
    .filter(([, value]) => typeof value !== 'function')
    .map(([key, value]) => (
      <tr key={key}>
        <td>{key}</td>
        <td>
          {typeof value === 'object' ? (
            <button onClick={() => console.log(value)}>Log value</button>
          ) : (
            JSON.stringify(value)
          )}
        </td>
      </tr>
    ))

  return (
    <table
      style={{
        position: 'fixed',
        top: 50,
        right: 50,
        backgroundColor: '#eee',
        textAlign: 'left',
        maxWidth: 500,
        padding: 20,
        borderSpacing: '25px 5px'
      }}
      {...props}
    >
      <thead>
        <tr>
          <th>Key</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>{cartPropertyRows}</tbody>
    </table>
  )
}
