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
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [appliedCode, setAppliedCode] = useState('');

  // Function to apply coupon code:
  const applyCoupon = async () => {
    const enteredCode = couponCode.trim().toUpperCase();

    // Prevent re-applying the same code
    if (enteredCode === appliedCode) {
      setCouponMessage('This coupon is already applied.');
      return;
    }
    if (subtotal < 15) {
      setCouponMessage('Coupons valid only on orders $15 or more.');
      setDiscount(0);
      return;
    }
    try {
      const res = await axios.post(`${process.env.REACT_APP_API}/api/chocolates/validate-coupon`, {
        code: couponCode,
      });
      if (res.data.discount) {
        setDiscount(res.data.discount);
        setAppliedCode(enteredCode); //tracks the applied coupon
        setCouponMessage(`Coupon applied: ${res.data.discount * 100}% off!`);
      } else {
        setCouponMessage('Invalid coupon code');
        setDiscount(0);
      }
    } catch (err) {
      console.error(err);
      const serverMessage = err.response?.data?.message;
      setCouponMessage(serverMessage || 'Error applying coupon');
      setDiscount(0);
    }
  };

  // Calculate subtotal and total cost
  const subtotal = cartItems.reduce((total, item) => {
    const itemTotal = item.price * item.quantity;
    return total + itemTotal;
  }, 0);

  const shipping = isLocalPickup ? 0 : 5.0;
  const discountedSubtotal = subtotal * (1 - discount);
  const totalNumber = discountedSubtotal + shipping;
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
        .then((response) => {
          if (!response.ok) {
            return response.json().then(err => {
              throw new Error(err.error || 'Failed to get PayPal configuration');
            });
          }
          return response.json();
        })
        .then((data) => {
          if (!data.clientId) {
            throw new Error('PayPal client ID is missing');
          }
          
          const script = document.createElement('script');
          // Add intent=CAPTURE for immediate payment capture
          script.src = `https://www.paypal.com/sdk/js?client-id=${data.clientId}&currency=USD&intent=capture`;
          script.id = 'paypal-sdk';
          script.onload = () => {
            console.log('PayPal SDK script loaded, waiting for initialization...');
            console.log('window.paypal available:', !!window.paypal);
            // Wait a moment for PayPal SDK to fully initialize
            setTimeout(() => {
              renderPayPalButtons();
            }, 500);
          };
          script.onerror = (error) => {
            console.error('PayPal SDK script failed to load:', error);
            Swal.fire({
              icon: 'error',
              title: 'Payment Service Unavailable',
              text: 'We couldn\'t load PayPal. Please check your internet connection, refresh the page, or try again later.',
              confirmButtonText: 'OK'
            });
            setPaypalError(true);
            setShowPayPal(false);
          };
          document.body.appendChild(script);
        })
        .catch((error) => {
          console.error('PayPal configuration error:', error);
          Swal.fire({
            icon: 'error',
            title: 'Payment Service Unavailable',
            text: error.message || 'We couldn\'t load PayPal. Please check your internet connection, refresh the page, or try again later.',
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
        text: 'We couldn\'t find the PayPal button. Please refresh the page and try again.',
        confirmButtonText: 'OK'
      });
      setShowPayPal(false);
      return;
    }

    // Check if PayPal SDK is loaded - try multiple times with increasing delays
    const checkPayPalReady = (attempts = 0, maxAttempts = 15) => {
      console.log(`Checking PayPal SDK readiness (attempt ${attempts + 1}/${maxAttempts})...`);
      console.log('window.paypal:', window.paypal);
      console.log('window.paypal.Buttons:', window.paypal?.Buttons);
      
      if (window.paypal && typeof window.paypal.Buttons === 'function') {
        console.log('PayPal SDK is ready');
        // Continue with rendering buttons
        return true;
      }
      
      if (attempts >= maxAttempts) {
        console.error('PayPal SDK failed to initialize after multiple attempts');
        console.error('Final check - window.paypal:', window.paypal);
        Swal.fire({
          icon: 'error',
          title: 'Payment Service Unavailable',
          text: 'PayPal is taking longer than expected to load. Please refresh the page and try again.',
          confirmButtonText: 'OK'
        });
        setPaypalError(true);
        setShowPayPal(false);
        return false;
      }
      
      // Retry with increasing delays
      const delay = Math.min(300 * (attempts + 1), 2000); // Cap at 2 seconds
      setTimeout(() => {
        if (checkPayPalReady(attempts + 1, maxAttempts)) {
          // If ready after retry, continue with rendering
          renderPayPalButtons();
        }
      }, delay);
      return false;
    };

    if (!checkPayPalReady()) {
      return;
    }

    window.paypal
      .Buttons({
        createOrder: (data, actions) => {
          const amount = Number(totalNumber);
          if (isNaN(amount) || amount <= 0) {
            throw new Error('Invalid payment amount');
          }
          console.log("Creating PayPal order for:", amount.toFixed(2));
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: amount.toFixed(2),
                  currency_code: 'USD'
                },
              },
            ],
          });
        },
        onApprove: (data, actions) => {
          return actions.order.capture().then((details) => {
            console.log('PayPal payment approved:', details);
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
                couponCode,
                discount,
              }),
            })
              .then((res) => {
                if (!res.ok) {
                  return res.json().then(err => {
                    throw new Error(err.error || 'Failed to save order');
                  });
                }
                return res.json();
              })
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
                console.error('Order submission error:', error);
                // Handle error with a user-friendly message
                Swal.fire({
                  icon: 'error',
                  title: 'Order Submission Failed',
                  text: error.message || 'We couldn\'t save your order. Please contact support if this issue persists.',
                  confirmButtonText: 'OK'
                });
              });
          }).catch((error) => {
            console.error('PayPal capture error:', error);
            Swal.fire({
              icon: 'error',
              title: 'Payment Capture Failed',
              text: 'Your payment was approved but could not be processed. Please contact support with your order ID.',
              confirmButtonText: 'OK'
            });
            setPaypalError(true);
            setShowPayPal(false);
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
          text: 'We couldn\'t load the PayPal buttons. Please refresh the page and try again.',
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
            <div className="coupon-section">
              <label htmlFor="coupon">Coupon Code</label>
              <div className="coupon-input-group">
                <input
                  type="text"
                  id="coupon"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="coupon-input"
                />
                <button onClick={applyCoupon} className="apply-coupon-button">
                  Apply
                </button>
              </div>
              {couponMessage && (
                <p className={`coupon-message ${discount === 0 ? 'error' : ''}`}>{couponMessage}</p>
              )}
            </div>
            <p>Subtotal <span>${discountedSubtotal.toFixed(2)}</span></p>
            <p>Shipping <span>${shipping.toFixed(2)}</span></p>
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
