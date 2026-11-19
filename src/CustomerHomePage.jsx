
import React, { useState, useEffect } from 'react';
import { CategoryNavigation } from './CategoryNavigation';
import { ProductList } from './ProductList';
import { Footer } from './Footer';
import { Header } from './Header';
import './assets/styles.css';

export default function CustomerHomePage() {
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [username, setUsername] = useState('');
  const [cartError, setCartError] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCartCount();
  }, []);

  

const fetchProducts = async (category = '') => {
  try {
    const url = category
      ? `http://localhost:9090/api/products?category=${encodeURIComponent(category)}`
      : 'http://localhost:9090/api/products';

    const response = await fetch(url, {
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.details || data.error ||
        `Failed to fetch products (${response.status})`
      );
    }

    const productList = Array.isArray(data)
      ? data
      : Array.isArray(data.products)
        ? data.products
        : [];

    setProducts(productList);

    const name =
      data.username ||
      data.user?.username ||
      data.user?.name ||
      '';

    setUsername(name);

  } catch (error) {
    console.error('Error fetching products:', error);
    setProducts([]);
  }
};
  const fetchCartCount = async () => {
    setIsCartLoading(true);

    try {
      const response = await fetch(
        'http://localhost:9090/api/cart/items/count',
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch cart count (${response.status})`
        );
      }

      const count = await response.json();

      setCartCount(Number(count) || 0);
      setCartError(false);
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartError(true);
    } finally {
      setIsCartLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    fetchProducts(category);
  };

  const handleAddToCart = async (productId) => {
    try {
      const response = await fetch(
        'http://localhost:9090/api/cart/add',
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId }),
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(
          message || `Failed to add product (${response.status})`
        );
      }

      await fetchCartCount();
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  return (
    <div className="customer-homepage">
      <Header
        cartCount={
          isCartLoading ? '...' : cartError ? 'Error' : cartCount
        }
        username={username}
      />

      <nav className="navigation">
        <CategoryNavigation onCategoryClick={handleCategoryClick} />
      </nav>

      <main className="main-content">
        <ProductList
          products={products}
          onAddToCart={handleAddToCart}
        />
      </main>

      <Footer />
    </div>
  );
}
