import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
// import Navbar from '../components/Navbar';

const MainLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Navbar */}
        {/* <Navbar /> */}

        {/* Dynamic Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;