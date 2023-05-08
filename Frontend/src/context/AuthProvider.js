import React from 'react'
import { createContext, useState } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({});//global state
    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </ AuthContext.Provider>
    )
}

export default AuthContext;