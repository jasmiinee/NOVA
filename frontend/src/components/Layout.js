// src/components/Layout.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  User, 
  TrendingUp, 
  BookOpen, 
  Users, 
  MessageCircle, 
  Star, 
  Settings,
  Menu,
  X,
  Bell,
  Search,
  LogOut
} from 'lucide-react';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../services/AuthContext';
import logo from '../assets/transparent_logo.png';

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [employeeName, setEmployeeName] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const dropdownRef = useRef(null);

  // Fetch employee data to get the name
  useEffect(() => {
    const fetchEmployeeName = async () => {
      try {
        if (!user?.employeeId || !token) return;

        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/employees/${user.employeeId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setEmployeeName(data.name);
        }
      } catch (err) {
        console.error('Error fetching employee name:', err);
      }
    };

    fetchEmployeeName();
  }, [user, token]);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Career Pathways', href: '/pathways', icon: TrendingUp },
    { name: 'AI Coach', href: '/aicoach', icon: MessageCircle },
    { name: 'Leadership', href: '/leadership', icon: Star },
  ];

  const isActive = (href) => location.pathname === href;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

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
          <SidebarContent navigation={navigation} isActive={isActive} />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-shrink-0">
        <div className="flex w-64 flex-col border-r border-gray-200 bg-white">
          <SidebarContent navigation={navigation} isActive={isActive} />
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

          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <Search className="h-5 w-5" />
                  </div>
                  <input
                    className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm"
                    placeholder="Search..."
                    type="search"
                  />
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <button
                type="button"
                className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <Bell className="h-6 w-6" />
              </button>
              <div className="ml-3 relative" ref={dropdownRef}>
                <button
                  type="button"
                  className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none hover:bg-gray-50 transition-colors"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <UserCircleIcon aria-hidden className="h-9 w-9 text-gray-400" />
                  <span className="ml-2 text-gray-700 text-sm font-medium">
                    {employeeName || 'User'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      {employeeName || user?.email}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarContent = ({ navigation, isActive }) => (
  <>
    <div className="flex items-center flex-shrink-0 px-4">
      <img
        className="h-12 pb-1 w-auto"
        src={logo}
        alt="NOVA"
      />
      <span className="ml-2 font-semibold text-xl text-gray-900">NOVA</span>
    </div>
    <nav className="mt-5 flex-1 px-2 space-y-1">
      {navigation.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
              isActive(item.href)
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Icon
              className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                isActive(item.href) ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
              }`}
            />
            {item.name}
          </Link>
        );
      })}
    </nav>
  </>
);