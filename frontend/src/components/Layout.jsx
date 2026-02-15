import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen">
            <Sidebar />
            <main className="flex-1 md:ml-64 p-4 md:p-8 pb-24 md:pb-8">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
