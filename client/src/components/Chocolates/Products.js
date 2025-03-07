import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Products.scss';
import '../../App.scss';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function Products({ showAlert }) {
  const [products, setProducts] = useState([]);
  const [isSortedAZ, setIsSortedAZ] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addToCart } = useCart();
  const navigate = useNavigate(); // Define navigate

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/chocolates');
        setProducts(res.data);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Oops! Unable to Load Products!',
          text: 'Please check your internet connection or refresh the page to try again.',
          confirmButtonText: 'OK'
        });
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
      </div>

      <div className="filter-buttons">
        <button onClick={handleSortAZ} className="sort-button">
          {isSortedAZ ? 'Z-A' : 'A-Z'}
        </button>
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <div key={product._id} className="product-card">
            <img
              src={product.image}
              alt={product.name}
              className="product-image"
              onClick={() => openProductModal(product)}
            />
            <h3 className="product-name" onClick={() => openProductModal(product)}>
              {product.name}
            </h3>
            <p className="product-price">${product.price} </p> {/* Display price with $ */}

            <div className="product-buttons">
              <button className="add-to-cart-button" onClick={() => handleAddToCart(product)}>
                Add to Cart
              </button>
              <button className="details-button" onClick={() => openProductModal(product)}>
                Details
              </button>
            </div>
          </div>

        ))}
      </div>

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
            <button className="add-to-cart-button" onClick={() => handleAddToCart(selectedProduct)}>Add to Cart</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;