import React from 'react';
import { Outlet } from 'react-router-dom';
import Register from './Register';

const Layout = () => {
    return (
        <main className='App'>
            <Outlet></Outlet>
        </main>
    )
}

export default Layout