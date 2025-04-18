import React, { useState, useEffect } from 'react';
import { adminAxiosInstance } from '../../config/axiosConfig';
import './AdminChocolates.scss';
import AdminNavbar from './AdminNavbar';
import '../../App.scss';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';

const AdminChocolates = () => {
  // State to store the list of chocolate products
  const [products, setProducts] = useState([]);

  // Fetch products from the backend on load
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await adminAxiosInstance.get('/api/chocolates'); // Fetch products from API
        if (response.data.length > 0) {
          setProducts(response.data); // Populate products from the database
        } else {
          console.error('No products found in the database. Seed the database first.');
        }
      } catch (error) {
        console.error('Error fetching chocolates:', error.message);
      }
    };
    fetchProducts();
  }, []);

  // Handle product field edits dynamically
  const handleEdit = (index, field, value) => {
    const updatedProducts = [...products]; // Copy the current product list
    updatedProducts[index][field] = value; // Update the specific field
    setProducts(updatedProducts); // Set the updated list
  };

  // Save edited product details to the database
  const saveChanges = async (index) => {
    const product = products[index]; // Get the product to be updated
    try {
      await adminAxiosInstance.put(`/api/chocolates/${product._id}`, product); // Update the product via API
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Product updated successfully!',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error updating product:',
        text: error.message,
        confirmButtonText: 'OK'
      });
    }
  };

    // Delete product
    const deleteProduct = async (index) => {
      const product = products[index]; // Get the product to be deleted
      try {
        await adminAxiosInstance.delete(`/api/chocolates/${product._id}`, product); // Update the product via API
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Product deleted successfully!',
          confirmButtonText: 'OK'
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error deleting product:',
          text: error.message,
          confirmButtonText: 'OK'
        });
      }
    };

  return (
    <div className="admin-chocolates">
      <AdminNavbar />
      <h3 className="section-title">Manage Chocolates</h3>
      <div className="products-grid">
        {products.map((product, index) => (
          <div key={product._id} className="admin-product-card">
            <img src={product.image} alt={product.name} className="product-image" />
            <div>
              <textarea
                value={product.name}
                onChange={(e) => handleEdit(index, 'name', e.target.value)}
              />
              <textarea
                value={product.description}
                onChange={(e) => handleEdit(index, 'description', e.target.value)}
              />
              <textarea
                value={product.details}
                onChange={(e) => handleEdit(index, 'details', e.target.value)}
              />
              <p>
                Price:
                <input
                  value={product.price}
                  onChange={(e) => handleEdit(index, 'price', e.target.value)}
                />
              </p>
              <p>
                Inventory:
                <input
                  type="number"
                  value={product.inventory}
                  onChange={(e) => handleEdit(index, 'inventory', parseInt(e.target.value))}
                />
              </p>
              <button onClick={() => saveChanges(index)}>Save Changes</button>
              <button className="deletebutton" onClick={() => deleteProduct(index)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminChocolates;
