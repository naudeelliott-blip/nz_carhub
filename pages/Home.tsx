
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { ArrowRight, MessageCircle, ShoppingBag, Search, Star, MapPin } from 'lucide-react';

const Home: React.FC = () => {
  const { listings, threads } = useStore();
  
  // Logic for "Fresh Listings" - just the 3 most recent
  const recentListings = listings.slice(0, 3);
  const recentThreads = threads.slice(0, 3);

  // Logic for "Featured Listings"
  const featuredListings = useMemo(() => {
    // Strictly filter items where isFeatured is true
    return listings.filter(l => l.isFeatured).slice(0, 3);
  }, [listings]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="relative max-w-7xl mx-auto text-center z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-white">
            The Hub for <span className="text-blue-500">Kiwi</span> Petrolheads
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto">
            Buy, sell, and discuss everything automotive in New Zealand. 
            From JDM legends to reliable utes, we've got you covered.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/marketplace" 
              className="px-8 py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-lg font-semibold transition-all flex items-center justify-center gap-2 text-white"
            >
              <ShoppingBag size={20} />
              Browse Marketplace
            </Link>
            <Link 
              to="/forum" 
              className="px-8 py-3 rounded-md bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-lg font-semibold transition-all flex items-center justify-center gap-2 text-white"
            >
              <MessageCircle size={20} />
              Join the Discussion
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        
        {/* Featured Listings Section */}
        {featuredListings.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-8">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full text-yellow-600 dark:text-yellow-400">
                <Star size={24} fill="currentColor" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Featured Vehicles</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Top picks and premium listings.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredListings.map(listing => (
                <div key={listing.id} className="group relative bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-yellow-200 dark:border-yellow-700">
                  <div className="absolute top-3 left-3 z-10 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                    <Star size={10} fill="currentColor" /> FEATURED
                  </div>
                  <div className="h-56 bg-gray-200 dark:bg-slate-700 relative overflow-hidden">
                    <img 
                      src={listing.images[0]} 
                      alt={listing.title} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                       <span className="text-white font-bold text-xl">${listing.price.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1">{listing.title}</h3>
                    <div className="flex text-sm text-gray-500 dark:text-gray-400 gap-3 mb-4 items-center">
                      <span className="bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs font-medium text-gray-800 dark:text-gray-200">{listing.year}</span>
                      {listing.type === 'car' && (
                        <>
                          <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                          <span>{listing.odometer.toLocaleString()}km</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center text-gray-400 text-xs mb-4">
                         <MapPin size={12} className="mr-1" /> {listing.location}
                    </div>
                    <Link 
                      to={`/marketplace/${listing.id}`} 
                      className="block w-full text-center py-2.5 bg-gray-900 dark:bg-slate-950 text-white rounded-lg text-sm font-medium hover:bg-blue-600 dark:hover:bg-blue-600 transition-colors"
                    >
                      View Listing
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Fresh Listings */}
        <section>
          <div className="flex justify-between items-end mb-8 border-b border-gray-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Fresh Listings</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">The latest rides hitting the market.</p>
            </div>
            <Link to="/marketplace" className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentListings.map(listing => (
              <div key={listing.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 dark:border-slate-700">
                <div className="h-48 bg-gray-200 dark:bg-slate-700 relative">
                  <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-bold uppercase">
                    {listing.location}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">{listing.title}</h3>
                    <span className="font-bold text-blue-600 dark:text-blue-400">${listing.price.toLocaleString()}</span>
                  </div>
                  <div className="flex text-sm text-gray-500 dark:text-gray-400 gap-3 mb-4">
                    <span>{listing.year}</span>
                    <span>•</span>
                    <span>{listing.odometer.toLocaleString()}km</span>
                  </div>
                  <Link 
                    to={`/marketplace/${listing.id}`} 
                    className="block w-full text-center py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
            {recentListings.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-400 dark:text-gray-500">
                    <p>No listings available yet. Be the first to sell!</p>
                </div>
            )}
          </div>
        </section>

        {/* Forum Preview */}
        <section>
          <div className="flex justify-between items-end mb-8 border-b border-gray-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Trending Discussions</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">See what the community is talking about.</p>
            </div>
            <Link to="/forum" className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1">
              Go to Forum <ArrowRight size={16} />
            </Link>
          </div>

          <div className="space-y-4">
            {recentThreads.map(thread => (
              <Link 
                key={thread.id} 
                to={`/forum/${thread.categoryId}`} 
                className="block bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-center">
                  <div className="flex gap-4 items-start">
                    <div className="p-3 bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-slate-600 transition-colors">
                      <MessageCircle size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {thread.title}
                      </h4>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 line-clamp-1">{thread.content}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-400 hidden sm:block">
                    <div>{thread.replies} replies</div>
                    <div>{thread.views} views</div>
                  </div>
                </div>
              </Link>
            ))}
             {recentThreads.length === 0 && (
                <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                    <p>No discussions yet. Start a topic in the Forum!</p>
                </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Home;
