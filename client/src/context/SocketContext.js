//Contains the global Socket.IO logic.

import React, { createContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

// Create Context
export const SocketContext = createContext();

// Socket.IO client instance
const socket = io('http://localhost:5001'); // Replace with your server URL

export const SocketProvider = ({ children }) => {
    const [slots, setSlots] = useState([]);
    const [events, setEvents] = useState([]);
    const [inventory, setInventory] = useState([]);

    useEffect(() => {
        // Listen for slot updates
        socket.on('slotBooked', ({ slotId }) => {
            setSlots((prevSlots) => prevSlots.filter((slot) => slot._id !== slotId));
        });

        // Example: Listen for event updates
        socket.on('eventUpdated', (updatedEvent) => {
            setEvents((prevEvents) =>
                prevEvents.map((event) =>
                    event._id === updatedEvent._id ? updatedEvent : event
                )
            );
        });

        // Example: Listen for inventory updates
        socket.on('inventoryUpdated', (updatedProduct) => {
            setInventory((prevInventory) =>
                prevInventory.map((product) =>
                    product._id === updatedProduct._id ? updatedProduct : product
                )
            );
        });

        // Cleanup on unmount
        return () => socket.disconnect();
    }, []);

    return (
        <SocketContext.Provider value={{ slots, setSlots, events, setEvents, inventory, setInventory }}>
            {children}
        </SocketContext.Provider>
    );
};
