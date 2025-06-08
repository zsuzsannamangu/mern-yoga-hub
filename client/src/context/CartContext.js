import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        // Load cart items from localStorage on initialization
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Save cart items to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // Add item to the cart
    const addToCart = (product) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item._id === product._id);
            if (existingItem) {
                // Update quantity if item already exists
                return prevItems.map((item) =>
                    item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevItems, { ...product, quantity: 1 }];
        });
    };

    // Update quantity of an item in the cart
    const updateQuantity = (productId, quantity) => {
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item._id === productId ? { ...item, quantity } : item
            )
        );
    };

    // Remove item from the cart
    const removeFromCart = (productId) => {
        setCartItems((prevItems) => prevItems.filter((item) => item._id !== productId));
    };

    // Clear all items from the cart
    const clearCart = () => {
        setCartItems([]);
    };

    // Calculate total number of items in the cart
    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeFromCart, clearCart, cartCount }}>
            {children}
        </CartContext.Provider>
    );
};
