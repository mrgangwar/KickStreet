import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isInitialized: boolean; // Added to help UI components wait for localstorage
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // 1. Load cart safely (Enhanced Hydration Fix)
  useEffect(() => {
    const savedCart = localStorage.getItem('kickstreet_cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      } catch (e) {
        console.error("KickStreet: Cart data corrupted, resetting...");
        localStorage.removeItem('kickstreet_cart');
      }
    }
    setIsInitialized(true); 
  }, []);

  // 2. Persistent Storage with Error Handling
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('kickstreet_cart', JSON.stringify(cart));
      } catch (e) {
        console.warn("KickStreet: LocalStorage limit reached or blocked.");
      }
    }
  }, [cart, isInitialized]);

  const addToCart = (newItem: CartItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item._id === newItem._id && item.size === newItem.size
      );

      if (existingItem) {
        return prevCart.map((item) =>
          item._id === newItem._id && item.size === newItem.size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...newItem, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, size: string, delta: number) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item._id === id && item.size === size) {
          const newQty = item.quantity + delta;
          // Ensuring quantity never drops below 1 via this method
          return { ...item, quantity: Math.max(1, newQty) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (id: string, size: string) => {
    setCart(prev => prev.filter((item) => !(item._id === id && item.size === size)));
  };

  const clearCart = () => {
    if (window.confirm("ARE YOU SURE YOU WANT TO CLEAR THE HEAT?")) {
      setCart([]);
    }
  };

  // Memoized values to prevent unnecessary re-renders in deep-nested responsive components
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      cartTotal, 
      cartCount,
      isInitialized 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};