import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsList = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );
      if (productsList) setProducts(JSON.parse(productsList));
    }
    console.log('executou');
    loadProducts();
  }, []);

  useEffect(() => {
    async function saveCartIntoStorage(): Promise<void> {
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify([...products]),
      );
    }
    saveCartIntoStorage();
  }, [products]);

  const increment = useCallback(
    async id => {
      const productIndex = products.findIndex(product => product.id === id);
      if (productIndex >= 0) {
        const newProducts = [...products];
        newProducts[productIndex].quantity += 1;
        setProducts(newProducts);
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productIndex = products.findIndex(product => product.id === id);
      if (productIndex >= 0) {
        const currentProduct = products[productIndex];
        const newProducts = [...products];
        if (currentProduct.quantity > 1) {
          newProducts[productIndex].quantity -= 1;
        } else {
          newProducts.splice(productIndex, 1);
        }
        setProducts(newProducts);
      }
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      const productIndex = products.findIndex(prod => prod.id === product.id);
      if (productIndex >= 0) increment(product.id);
      else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }
    },
    [increment, products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
