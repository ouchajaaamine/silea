"use client"

import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import { Product, ProductSizeCode, ProductSize, getSizesForCategory, calculatePrice, getPriceForSize } from './api'

// Types
export interface CartProduct {
  id: number
  name: string
  nameAr: string
  basePrice: number // Base price for largest size
  imageUrl: string
  category: {
    id: number
    name: string
  }
  sizePrices?: { size: ProductSizeCode; sizeCode?: string; price: number }[]
}

export interface CartItemType {
  product: CartProduct
  quantity: number
  size: ProductSize
  unitPrice: number // Calculated price based on size
}

interface CartState {
  items: CartItemType[]
  isOpen: boolean
}

type CartAction =
  | { type: 'ADD_ITEM'; product: CartProduct; quantity?: number; size: ProductSize }
  | { type: 'REMOVE_ITEM'; productId: number; sizeCode: ProductSizeCode }
  | { type: 'UPDATE_QUANTITY'; productId: number; sizeCode: ProductSizeCode; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'LOAD_CART'; items: CartItemType[] }

interface CartContextType {
  items: CartItemType[]
  isOpen: boolean
  addItem: (product: CartProduct | Product, size: ProductSize, quantity?: number) => void
  removeItem: (productId: number, sizeCode: ProductSizeCode) => void
  updateQuantity: (productId: number, sizeCode: ProductSizeCode, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  totalItems: number
  subtotal: number
  getItemQuantity: (productId: number, sizeCode?: ProductSizeCode) => number
  getSizesForProduct: (product: CartProduct | Product) => ProductSize[]
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      // Find existing item with same product AND size
      const existingItem = state.items.find(
        item => item.product.id === action.product.id && item.size.code === action.size.code
      )
      const quantityToAdd = action.quantity || 1
      
      // Get price from explicit sizePrices if available, otherwise fallback to multiplier calculation
      let unitPrice = calculatePrice(action.product.basePrice, action.size)
      if (action.product.sizePrices && action.product.sizePrices.length > 0) {
        const sizePrice = action.product.sizePrices.find(
          sp => sp.size === action.size.code || sp.sizeCode === action.size.code
        )
        if (sizePrice) {
          unitPrice = sizePrice.price
        }
      }
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.product.id === action.product.id && item.size.code === action.size.code
              ? { ...item, quantity: item.quantity + quantityToAdd }
              : item
          ),
        }
      }
      
      return {
        ...state,
        items: [...state.items, { 
          product: action.product, 
          quantity: quantityToAdd,
          size: action.size,
          unitPrice: unitPrice
        }],
      }
    }
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(
          item => !(item.product.id === action.productId && item.size.code === action.sizeCode)
        ),
      }
    
    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            item => !(item.product.id === action.productId && item.size.code === action.sizeCode)
          ),
        }
      }
      
      return {
        ...state,
        items: state.items.map(item =>
          item.product.id === action.productId && item.size.code === action.sizeCode
            ? { ...item, quantity: action.quantity }
            : item
        ),
      }
    }
    
    case 'CLEAR_CART':
      return { ...state, items: [] }
    
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen }
    
    case 'OPEN_CART':
      return { ...state, isOpen: true }
    
    case 'CLOSE_CART':
      return { ...state, isOpen: false }
    
    case 'LOAD_CART':
      return { ...state, items: action.items }
    
    default:
      return state
  }
}

const CART_STORAGE_KEY = 'silea_cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false })

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY)
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        if (Array.isArray(parsedCart)) {
          dispatch({ type: 'LOAD_CART', items: parsedCart })
        }
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error)
    }
  }, [])

  // Save cart to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items))
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error)
    }
  }, [state.items])

  const addItem = (product: CartProduct | Product, size: ProductSize, quantity = 1) => {
    const cartProduct: CartProduct = {
      id: product.id,
      name: product.name,
      nameAr: 'nameAr' in product ? product.nameAr : (product as any).nameAr,
      // product may be either a Product (has `price`) or a CartProduct (has `basePrice`)
      basePrice: 'price' in product ? product.price : (product as CartProduct).basePrice,
      imageUrl: 'imageUrl' in product ? product.imageUrl : (product as any).imageUrl,
      category: 'category' in product ? (product as any).category : { id: 0, name: '' },
      sizePrices: 'sizePrices' in product && product.sizePrices 
        ? product.sizePrices.map(sp => ({ size: sp.size, sizeCode: sp.sizeCode, price: sp.price }))
        : undefined,
    }
    dispatch({ type: 'ADD_ITEM', product: cartProduct, quantity, size })
  }

  const removeItem = (productId: number, sizeCode: ProductSizeCode) => {
    dispatch({ type: 'REMOVE_ITEM', productId, sizeCode })
  }

  const updateQuantity = (productId: number, sizeCode: ProductSizeCode, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', productId, sizeCode, quantity })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' })
  }

  const openCart = () => {
    dispatch({ type: 'OPEN_CART' })
  }

  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' })
  }

  const totalItems = state.items.reduce((total, item) => total + item.quantity, 0)
  
  const subtotal = state.items.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0
  )

  const getItemQuantity = (productId: number, sizeCode?: ProductSizeCode) => {
    if (sizeCode) {
      const item = state.items.find(
        item => item.product.id === productId && item.size.code === sizeCode
      )
      return item ? item.quantity : 0
    }
    // Return total quantity for product across all sizes
    return state.items
      .filter(item => item.product.id === productId)
      .reduce((total, item) => total + item.quantity, 0)
  }

  const getSizesForProduct = (product: CartProduct | Product) => {
    return getSizesForCategory(product.category.name)
  }

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
        totalItems,
        subtotal,
        getItemQuantity,
        getSizesForProduct,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

