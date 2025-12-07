
import React from 'react';
import { useStore } from '../store';
import { Link, Navigate } from 'react-router-dom';
import { Heart, MapPin, Search } from 'lucide-react';

const SavedListings: React.FC = () => {
  const { currentUser, listings, toggleSavedListing } = useStore();

  if (!currentUser) return <Navigate to="/auth" />;

  const savedIds = currentUser.savedListingIds || [];
  
  // Filter listings based on saved IDs
  const savedListings = listings.filter(l => savedIds.includes(l.id));

  const handleUnsave = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSavedListing(id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="text-red-500" size={32} fill="currentColor" />
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Saved Listings</h1>
            <p className="text-gray-500 dark:text-gray-400">Vehicles and parts you have bookmarked</p>
        </div>
      </div>

      {savedListings.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-12 text-center">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No saved listings</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Click the heart icon on any listing to save it here for later.</p>
            <Link to="/marketplace" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                <Search size={18} />
                Browse Marketplace
            </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {savedListings.map(listing => (
                 <Link 
                    key={listing.id} 
                    to={`/marketplace/${listing.id}`}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-900 transition-all group overflow-hidden relative"
                >
                    <div className="aspect-[4/3] bg-gray-200 dark:bg-slate-700 relative overflow-hidden">
                        <img 
                            src={listing.images[0]} 
                            alt={listing.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                            <span className="text-white font-bold text-lg">${listing.price.toLocaleString()}</span>
                        </div>
                        <button 
                            onClick={(e) => handleUnsave(e, listing.id)}
                            className="absolute top-2 right-2 p-2 bg-white dark:bg-slate-800 rounded-full shadow-md text-red-500 hover:scale-110 transition-transform z-10"
                            title="Remove from Saved"
                        >
                            <Heart size={18} fill="currentColor" />
                        </button>
                    </div>
                    <div className="p-4">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{listing.title}</h3>
                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs mb-2 gap-2">
                            <span className="bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded font-medium">{listing.year}</span>
                            {listing.type === 'car' && (
                                <span>{listing.odometer.toLocaleString()} km</span>
                            )}
                        </div>
                        <div className="flex items-center text-gray-400 dark:text-gray-500 text-xs">
                            <MapPin size={12} className="mr-1" /> {listing.location}
                        </div>
                    </div>
                </Link>
            ))}
        </div>
      )}
    </div>
  );
};

export default SavedListings;
