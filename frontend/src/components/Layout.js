// src/components/Layout.jsx
import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, TrendingUp, MessageCircle, Star, Menu, X, Bell, Search } from 'lucide-react';

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Career Pathways', href: '/pathways', icon: TrendingUp },
    { name: 'AI Coach', href: '/aicoach', icon: MessageCircle },
    { name: 'Leadership', href: '/leadership', icon: Star },
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-40 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        {/* overlay */}
        <div
          className={`fixed inset-0 bg-gray-600 transition-opacity ${sidebarOpen ? 'bg-opacity-50' : 'bg-opacity-0'}`}
          onClick={() => setSidebarOpen(false)}
        />
        {/* drawer */}
        <div
          className={`relative ml-0 h-full w-72 max-w-xs bg-white shadow-xl transition-transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <button
            type="button"
            className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
          <SidebarContent navigation={navigation} />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-shrink-0">
        <div className="flex w-64 flex-col border-r border-gray-200 bg-white">
          <SidebarContent navigation={navigation} />
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="relative z-10 flex h-16 flex-shrink-0 items-center bg-white shadow">
          <button
            type="button"
            className="px-4 text-gray-500 md:hidden"
            aria-label="Open sidebar"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 items-center justify-between px-4">
            <div className="flex-1">
              <div className="relative text-gray-400 focus-within:text-gray-600">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                  <Search className="h-5 w-5" />
                </div>
                <input
                  className="block w-full rounded-md border-0 py-2 pl-8 pr-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none"
                  placeholder="Search..."
                  type="search"
                />
              </div>
            </div>

            <div className="ml-4 flex items-center">
              <button
                type="button"
                className="rounded-full p-1 text-gray-400 hover:text-gray-600"
                aria-label="Notifications"
              >
                <Bell className="h-6 w-6" />
              </button>
              <div className="ml-3 flex items-center rounded-full bg-white text-sm">
                <img className="h-8 w-8 rounded-full" src="https://via.placeholder.com/32" alt="User avatar" />
                <span className="ml-2 text-sm font-medium text-gray-700">Samantha Lee</span>
              </div>
            </div>
          </div>
        </header>

        {/* Routed content */}
        <main className="relative flex-1 overflow-y-auto focus:outline-none">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarContent = ({ navigation }) => (
  <>
    <div className="flex items-center px-4 py-4">
      <img className="h-8 w-auto" src="https://via.placeholder.com/100x32.png?text=NOVA" alt="NOVA" />
      <span className="ml-2 text-xl font-semibold text-gray-900">NOVA</span>
    </div>
    <nav className="mt-2 flex-1 space-y-1 px-2">
      {navigation.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/dashboard'} 
            className={({ isActive }) =>
              `group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors
               ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-teal-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
                {item.name}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  </>
);
