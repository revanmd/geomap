"use client";

import { createContext, useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info } from "lucide-react";

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showMessage = (message, icon = null) => {
        const id = Date.now();
        setToasts((prevToasts) => [...prevToasts, { id, message, icon }]);

        setTimeout(() => {
            setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
        }, 3000);
    };

    return (
        <MessageContext.Provider value={{ showMessage }}>
            {children}
            <div
                className="message-position-survey"
            >
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.1, ease: "easeInOut" }}
                        >
                            <div
                                className="p-3 bg-black rounded-lg shadow-md text-xs flex items-center"
                                style={{
                                    backgroundColor: "#232B40",
                                    color: 'white',
                                    margin: "10px"
                                }}
                            >
                                <div className="w-6 flex mr-2">
                                    {toast.icon && <>{toast.icon}</>}  
                                </div>
                                <div className="flex-auto text-xs font-semibold">
                                    {toast.message}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </MessageContext.Provider >
    );
};

export const useMessage = () => {
    return useContext(MessageContext);
};
