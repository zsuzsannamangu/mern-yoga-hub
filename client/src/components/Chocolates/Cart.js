import React, { useState } from 'react';
import Swal from 'sweetalert2'; // SweetAlert2 is already imported
import './Cart.scss';
import '../../App.scss';
import { useCart } from '../../context/CartContext';
import axios from 'axios';

/* 
* Cart Component
* Displays a shopping cart with items, order summary, and PayPal payment integration
*/

function Cart() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const [showPayPal, setShowPayPal] = useState(false);
  const [paypalError, setPaypalError] = useState(false);
  const [isLocalPickup, setIsLocalPickup] = useState(false);

  // Calculate subtotal and total cost
  const subtotal = cartItems.reduce((total, item) => {
    const itemTotal = item.price * item.quantity;
    return total + itemTotal;
  }, 0);

  const shipping = isLocalPickup ? 0 : 5.0;
  const totalNumber = subtotal + shipping;
  const total = totalNumber.toFixed(2); // for display only

  // Updates item quantity in the cart, ensuring it doesn't go below 1.
  const handleQuantityChange = (productId, quantity) => {
    updateQuantity(productId, Math.max(1, quantity));
  };

  // Initiates PayPal checkout process. Loads PayPal SDK dynamically if not already loaded.
  const handlePaymentClick = () => {
    setShowPayPal(true);

    if (!document.querySelector('#paypal-sdk')) {
      fetch(`${process.env.REACT_APP_API}/config/paypal`)
        .then((response) => response.json())
        .then((data) => {
          const script = document.createElement('script');
          script.src = `https://www.paypal.com/sdk/js?client-id=${data.clientId}&currency=USD`;
          script.id = 'paypal-sdk';
          script.onload = () => renderPayPalButtons();
          script.onerror = () => {
            Swal.fire({
              icon: 'error',
              title: 'Payment Service Unavailable',
              text: 'We couldn’t load PayPal. Please refresh the page or try again later.',
              confirmButtonText: 'OK'
            });
            setPaypalError(true);
            setShowPayPal(false);
          };
          document.body.appendChild(script);
        })
        .catch((error) => {
          Swal.fire({
            icon: 'error',
            title: 'Payment Service Unavailable',
            text: 'We couldn’t load PayPal. Please check your internet connection, refresh the page, or try again later.',
            confirmButtonText: 'Retry'
          });
          setPaypalError(true);
          setShowPayPal(false);
        });
    } else {
      renderPayPalButtons();
    }
  };

  // Renders PayPal buttons for payment processing
  const renderPayPalButtons = () => {
    const container = document.getElementById('paypal-button-container');
    if (!container) {
      Swal.fire({
        icon: 'error',
        title: 'Payment Error',
        text: 'We couldn’t find the PayPal button. Please refresh the page and try again.',
        confirmButtonText: 'OK'
      });
      setShowPayPal(false);
      return;
    }

    window.paypal
      .Buttons({
        createOrder: (data, actions) => {
          console.log("Creating order for:", totalNumber.toFixed(2));
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: totalNumber.toFixed(2),
                },
              },
            ],
          });
        },
        onApprove: (data, actions) => {
          return actions.order.capture().then((details) => {
            clearCart(); // clear the cart after successful payment
            Swal.fire({
              icon: 'success',
              title: 'Payment Successful',
              text: 'Transaction completed!',
            });

            // Send order details to backend
            fetch(`${process.env.REACT_APP_API}/api/orders`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: details.id,
                payerName: details.payer.name.given_name,
                payerEmail: details.payer.email_address,
                transactionAmount: details.purchase_units[0].amount.value,
                cartItems,
                isLocalPickup,
              }),
            })
              .then((res) => res.json())
              .then((response) => {
                // Show confirmation message or redirect user
                Swal.fire({
                  icon: 'success',
                  title: 'Order Confirmed!',
                  text: 'Your order has been successfully placed.',
                  confirmButtonText: 'OK'
                });
              })
              .catch((error) => {
                // Handle error with a user-friendly message
                Swal.fire({
                  icon: 'error',
                  title: 'Order Submission Failed',
                  text: 'We couldn’t save your order. Please contact support if this issue persists.',
                  confirmButtonText: 'OK'
                });
              });
          });
        },

        onError: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Payment Unsuccessful',
            text: 'Your payment could not be processed. Please check your payment details and try again.',
            confirmButtonText: 'Try Again'
          });
          setPaypalError(true);
          setShowPayPal(false);
        },
      })
      .render('#paypal-button-container')
      .catch((err) => {
        Swal.fire({
          icon: 'error',
          title: 'Payment Button Error',
          text: 'We couldn’t load the PayPal buttons. Please refresh the page and try again.',
          confirmButtonText: 'Refresh Page'
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
            <div className="pickup-option">
              <label>
                <input
                  type="checkbox"
                  checked={isLocalPickup}
                  onChange={(e) => setIsLocalPickup(e.target.checked)}
                />
                Local Pickup (no shipping fee)
              </label>
            </div>
            <p>Subtotal <span>${subtotal.toFixed(2)}</span></p>
            <p>Shipping <span>${shipping.toFixed(2)}</span></p>
            {/* <p>Tax <span>${(subtotal * 0.1).toFixed(2)}</span></p> */}
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
