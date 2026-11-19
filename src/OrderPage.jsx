
import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import './assets/styles.css';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [username, setUsername] = useState('');
  const [cartError, setCartError] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    fetchCartCount();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        'http://localhost:9090/api/orders',
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch orders (${response.status})`);
      }

      // Read the response body only once.
      const data = await response.json();

      // Support either an array or an object containing orders.
      const orderList = Array.isArray(data)
        ? data
        : Array.isArray(data.orders)
          ? data.orders
          : Array.isArray(data.products)
            ? data.products
            : [];

      setOrders(orderList);

      // Use a username only if the API actually returns one.
      const name =
        data.username ||
        data.user?.username ||
        data.user?.name ||
        '';

      if (name) {
        setUsername(name);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Unable to load orders.');
    } finally {
      setLoading(false);
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
    } catch (err) {
      console.error('Error fetching cart count:', err);
      setCartError(true);
    } finally {
      setIsCartLoading(false);
    }
  };

  return (
    <div className="maindiv">
      <div className="customer-homepage">
        <Header
          cartCount={
            isCartLoading ? '...' : cartError ? 'Error' : cartCount
          }
          username={username}
        />

        <main className="main-content">
          <h1 className="form-title">Your Orders</h1>

          {loading && <p>Loading orders...</p>}

          {error && <p className="error-message">{error}</p>}

          {!loading && !error && orders.length === 0 && (
            <p>No orders found. Start shopping now!</p>
          )}

          {!loading && !error && orders.length > 0 && (
            <div className="orders-list">
              {orders.map((order, index) => (
                <div
                  key={order.order_id ?? index}
                  className="order-card"
                >
                  <div className="order-card-header">
                    <h3>Order ID: {order.order_id}</h3>
                  </div>

                  <div className="order-card-body">
                    <img
                      src={order.image_url}
                      alt={order.name || 'Product'}
                      className="order-product-image"
                    />

                    <div className="order-details">
                      <h3>Product Name: {order.name}</h3>
                      <h3>Description: {order.description}</h3>
                      <h3>Quantity: {order.quantity}</h3>

                      <h3>
                        Price per Unit: ₹
                        {Number(order.price_per_unit || 0).toFixed(2)}
                      </h3>

                      <h3>
                        Total Price: ₹
                        {Number(order.total_price || 0).toFixed(2)}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}
