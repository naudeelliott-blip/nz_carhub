
import React from 'react';
import { useStore } from '../store';
import { Link, Navigate } from 'react-router-dom';
import { Clock, MapPin, Search } from 'lucide-react';

const History: React.FC = () => {
  const { currentUser, listings, viewHistory } = useStore();

  if (!currentUser) return <Navigate to="/auth" />;

  // Filter listings based on history IDs
  // We map the history IDs to listing objects, filtering out any that might have been deleted
  const historyListings = viewHistory
    .map(id => listings.find(l => l.id === id))
    .filter((l): l is typeof listings[0] => l !== undefined);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Clock className="text-blue-600 dark:text-blue-400" size={32} />
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Viewing History</h1>
            <p className="text-gray-500 dark:text-gray-400">Listings you have recently viewed</p>
        </div>
      </div>

      {historyListings.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-12 text-center">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No history yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Items you view in the Marketplace will appear here.</p>
            <Link to="/marketplace" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                <Search size={18} />
                Browse Marketplace
            </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {historyListings.map(listing => (
                 <Link 
                    key={listing.id} 
                    to={`/marketplace/${listing.id}`}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-900 transition-all group overflow-hidden"
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

export default History;
