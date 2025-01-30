import React, { useState } from 'react';
import Swal from 'sweetalert2'; // SweetAlert2 is already imported
import './Cart.scss';
import '../../App.scss';
import { useCart } from '../../context/CartContext';

function Cart() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const [showPayPal, setShowPayPal] = useState(false);
  const [paypalError, setPaypalError] = useState(false);

  const subtotal = cartItems.reduce((total, item) => {
    const itemTotal = item.price * item.quantity;
    return total + itemTotal;
  }, 0);

  const total = (subtotal + 5 + subtotal * 0.1).toFixed(2);

  const handleQuantityChange = (productId, quantity) => {
    updateQuantity(productId, Math.max(1, quantity));
  };

  const handlePaymentClick = () => {
    setShowPayPal(true);

    if (!document.querySelector('#paypal-sdk')) {
      fetch('http://localhost:5001/config/paypal')
        .then((response) => response.json())
        .then((data) => {
          const script = document.createElement('script');
          script.src = `https://www.paypal.com/sdk/js?client-id=${data.clientId}&currency=USD`;
          script.id = 'paypal-sdk';
          script.onload = () => renderPayPalButtons();
          script.onerror = () => {
            console.error('Failed to load PayPal SDK.');
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to load PayPal. Please try again later.',
            });
            setPaypalError(true);
            setShowPayPal(false);
          };
          document.body.appendChild(script);
        })
        .catch((error) => {
          console.error('Error fetching PayPal Client ID:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load PayPal. Please try again later.',
          });
          setPaypalError(true);
          setShowPayPal(false);
        });
    } else {
      renderPayPalButtons();
    }
  };

  const renderPayPalButtons = () => {
    const container = document.getElementById('paypal-button-container');
    if (!container) {
      console.error('PayPal button container not found.');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'PayPal button container not found. Please try again.',
      });
      setShowPayPal(false);
      return;
    }

    window.paypal
      .Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: total,
                },
              },
            ],
          });
        },
        onApprove: (data, actions) => {
          return actions.order.capture().then((details) => {
            Swal.fire({
              icon: 'success',
              title: 'Payment Successful',
              text: 'Transaction completed!',
            });

            // Send order details to backend
            fetch("http://localhost:5001/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: details.id,
                payerName: details.payer.name.given_name,
                payerEmail: details.payer.email_address,
                transactionAmount: details.purchase_units[0].amount.value,
                cartItems,
              }),
            })
              .then((res) => res.json())
              .then((response) => console.log("Order saved:", response))
              .catch((error) => console.error("Order save failed:", error));
          });
        },

        onError: (err) => {
          console.error('PayPal Checkout Error:', err);
          Swal.fire({
            icon: 'error',
            title: 'Payment Failed',
            text: 'Payment failed. Please try again.',
          });
          setPaypalError(true);
          setShowPayPal(false);
        },
      })
      .render('#paypal-button-container')
      .catch((err) => {
        console.error('PayPal Buttons Rendering Error:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to render PayPal buttons. Please try again.',
        });
        setPaypalError(true);
        setShowPayPal(false);
      });
  };

  return (
    <div className="cart-page">
      <h1 className="cart-title">Cart</h1>
      <div className="title-line"></div>
      <p className="cart-items-count">{cartItems.length} items</p>
      <div className="cart-content">
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item._id} className="cart-item">
              <img src={item.image} alt={item.name} className="cart-item-image" />
              <div className="cart-item-details">
                <h2 className="cart-item-name">{item.name}</h2>
                <p className="cart-item-price">${item.price}/tin</p>
                <div className="cart-item-quantity">
                  <input
                    type="number"
                    value={item.quantity}
                    min="1"
                    className="quantity-input"
                    onChange={(e) =>
                      handleQuantityChange(item._id, parseInt(e.target.value, 10))
                    }
                  />
                  <button
                    className="remove-button"
                    onClick={() => removeFromCart(item._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="order-summary">
          <h2>Order summary</h2>
          <div className="summary-details">
            <p>Subtotal <span>${subtotal.toFixed(2)}</span></p>
            <p>Shipping <span>$5.00</span></p>
            <p>Tax <span>${(subtotal * 0.1).toFixed(2)}</span></p>
            <p className="total">Total <span>${total}</span></p>
          </div>
          {!showPayPal ? (
            <button className="continue-button" onClick={handlePaymentClick}>
              Continue to Payment
            </button>
          ) : (
            <div id="paypal-button-container"></div>
          )}
          {paypalError && (
            <p className="error-message">
              Failed to load PayPal. Please try again later.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Cart;
