import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './Products.scss';
import '../../App.scss';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { motion } from 'framer-motion';

function Products({ showAlert }) {
  const [products, setProducts] = useState([]);
  const [isSortedAZ, setIsSortedAZ] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addToCart } = useCart();
  const navigate = useNavigate(); // Define navigate
  const alertShown = useRef(false);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3, // delay between each product
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API}/api/chocolates`);
        setProducts(res.data);
        alertShown.current = false; // reset if successful
      } catch (error) {
        if (!alertShown.current) {
          alertShown.current = true; // prevent repeat alerts
          Swal.fire({
            icon: 'error',
            title: 'Oops! Unable to Load Products!',
            text: 'Please check your internet connection or refresh the page to try again.',
            confirmButtonText: 'OK'
          });
        }
      }
    };
    fetchProducts();
  }, [showAlert]);

  const handleSortAZ = () => {
    const sortedProducts = [...products].sort((a, b) => {
      return isSortedAZ ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
    });
    setProducts(sortedProducts);
    setIsSortedAZ(!isSortedAZ);
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  const handleAddToCart = (product) => {
    addToCart(product); // Add the product to the cart

    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: `Added "${product.name}" to the cart!`,
      showCancelButton: true,
      confirmButtonText: 'Go to Cart',
      cancelButtonText: 'Continue Shopping',
      customClass: {
        confirmButton: 'swal-gotocart-button',
      }
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/cart'); // Navigate to the cart page
      }
    });
  };

  return (
    <div className="products-section">
      <div className="products-header">
        <h2 className="section-title" id="products-section">Products</h2>
        <div className="title-line"></div>
        <div className="vacationtext">
          Currently away, all orders will be lovingly fulfilled on September 3rd. Thank you for your patience!
        </div>
      </div>

      <div className="filter-buttons">
        <button onClick={handleSortAZ} className="sort-button">
          {isSortedAZ ? 'Z-A' : 'A-Z'}
        </button>
      </div>

      <motion.div
        className="products-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {products.map((product) => (
          <motion.div
            key={product._id}
            className="product-card"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <img
              src={product.image}
              alt={product.name}
              className="product-image"
              onClick={() => openProductModal(product)}
            />
            <h3 className="product-name" onClick={() => openProductModal(product)}>
              {product.name}
            </h3>
            <p className="product-price">${product.price}</p>

            <div className="product-buttons">
              {product.inventory === 0 ? (
                <button disabled className="sold-out-button">Sold Out</button>
              ) : (
                <button className="add-to-cart-button" onClick={() => handleAddToCart(product)}>
                  Add to Cart
                </button>
              )}
              <button className="details-button" onClick={() => openProductModal(product)}>
                Details
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Product Modal */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeModal}>X</button>
            <img src={selectedProduct.image} alt={selectedProduct.name} className="modal-image" />
            <h3>{selectedProduct.name}</h3>
            <p className="modal-description">{selectedProduct.description}</p>
            <p className="modal-details">{selectedProduct.details}</p>
            <p className="modal-price">${selectedProduct.price} / tin</p>
            {selectedProduct.inventory === 0 ? (
              <button disabled className="sold-out-button">Sold Out</button>
            ) : (
              <button className="add-to-cart-button" onClick={() => handleAddToCart(selectedProduct)}>
                Add to Cart
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;