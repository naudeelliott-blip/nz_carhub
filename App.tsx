
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './store';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Forum from './pages/Forum';
import Marketplace from './pages/Marketplace';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Inbox from './pages/Inbox';
import ManageListings from './pages/ManageListings';
import Auth from './pages/Auth';
import History from './pages/History';
import EditListing from './pages/EditListing';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/forum/:categoryId" element={<Forum />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/marketplace/:listingId" element={<Marketplace />} />
              <Route path="/marketplace/edit/:listingId" element={<EditListing />} />
              <Route path="/manage-listings" element={<ManageListings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/history" element={<History />} />
            </Routes>
          </main>
          
          <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 py-8 mt-12 border-t border-slate-800 dark:border-slate-900">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <p>&copy; {new Date().getFullYear()} NZ CarHub. Built for Kiwi petrolheads.</p>
                <p className="text-sm mt-2">Disclaimer: MVP Demo. Images from Picsum.</p>
            </div>
          </footer>
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;
