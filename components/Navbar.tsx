
import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Car, Menu, X, LogOut, Sun, Moon, User as UserIcon, List, Mail, Clock, ChevronDown } from 'lucide-react';
import { useStore } from '../store';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currentUser, logout, directMessages, theme, toggleTheme } = useStore();
  const navigate = useNavigate();

  // Simple unread count for demo purposes (messages where I am receiver and not read)
  const unreadCount = currentUser 
    ? directMessages.filter(m => m.receiverId === currentUser.id && !m.isRead).length
    : 0;

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const NavItem = ({ to, label }: { to: string; label: string }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
          isActive
            ? 'bg-blue-600 text-white dark:bg-blue-600'
            : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-slate-800 dark:hover:text-blue-400'
        }`
      }
      onClick={() => setIsOpen(false)}
    >
      {label}
    </NavLink>
  );

  return (
    <nav className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <Car className="h-8 w-8 text-blue-600 dark:text-blue-500" />
              <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
                NZ CarHub
              </span>
            </Link>
            <div className="hidden md:ml-8 md:flex md:space-x-4">
              <NavLink to="/" className={({isActive}) => isActive ? "text-blue-600 dark:text-blue-400 font-semibold px-3 py-2" : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2"}>Home</NavLink>
              <NavLink to="/forum" className={({isActive}) => isActive ? "text-blue-600 dark:text-blue-400 font-semibold px-3 py-2" : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2"}>Forum</NavLink>
              <NavLink to="/marketplace" className={({isActive}) => isActive ? "text-blue-600 dark:text-blue-400 font-semibold px-3 py-2" : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2"}>Marketplace</NavLink>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
             <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {currentUser ? (
              <div className="relative ml-2" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none transition-colors p-1 rounded-full hover:bg-gray-50 dark:hover:bg-slate-700 border border-transparent hover:border-gray-200 dark:hover:border-slate-600"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="h-8 w-8 rounded-full border border-gray-200 dark:border-slate-600 object-cover"
                  />
                  <span className="font-medium max-w-[100px] truncate">{currentUser.name}</span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  {unreadCount > 0 && (
                     <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full w-3 h-3"></span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-100">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{currentUser.email}</p>
                    </div>
                    
                    <div className="py-1">
                      <Link 
                        to="/profile" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <UserIcon size={16} /> Profile
                      </Link>
                      <Link 
                        to="/manage-listings" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <List size={16} /> My Listings
                      </Link>
                      <Link 
                        to="/inbox" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 justify-between"
                      >
                        <div className="flex items-center gap-3">
                            <Mail size={16} /> Inbox
                        </div>
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                      </Link>
                      <Link 
                        to="/history" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <Clock size={16} /> History
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 dark:border-slate-700 py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800"
              >
                Sign In
              </Link>
            )}
          </div>

          <div className="-mr-2 flex items-center md:hidden gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors rounded-full"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavItem to="/" label="Home" />
            <NavItem to="/forum" label="Forum" />
            <NavItem to="/marketplace" label="Marketplace" />
          </div>
          <div className="pt-4 pb-4 border-t border-gray-200 dark:border-slate-700">
            {currentUser ? (
              <>
                <div className="flex items-center px-5 mb-3">
                    <div className="flex-shrink-0">
                    <img
                        className="h-10 w-10 rounded-full"
                        src={currentUser.avatar}
                        alt=""
                    />
                    </div>
                    <div className="ml-3">
                    <div className="text-base font-medium leading-none text-gray-800 dark:text-white">
                        {currentUser.name}
                    </div>
                    <div className="text-sm font-medium leading-none text-gray-500 dark:text-gray-400 mt-1">
                        {currentUser.email}
                    </div>
                    </div>
                </div>
                <div className="space-y-1 px-2">
                    <NavItem to="/profile" label="Profile" />
                    <NavItem to="/manage-listings" label="My Listings" />
                    <NavItem to="/inbox" label={`Inbox ${unreadCount > 0 ? `(${unreadCount})` : ''}`} />
                    <NavItem to="/history" label="History" />
                    <button
                        onClick={handleLogout}
                        className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-100 dark:hover:bg-slate-700"
                    >
                        Sign Out
                    </button>
                </div>
              </>
            ) : (
              <div className="px-5">
                <Link
                  to="/auth"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
