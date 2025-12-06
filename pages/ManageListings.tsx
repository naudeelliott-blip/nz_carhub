
import React from 'react';
import { useStore } from '../store';
import { Trash2, Eye, Plus, List, Edit } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

const ManageListings: React.FC = () => {
  const { currentUser, listings, deleteListing } = useStore();

  if (!currentUser) return <Navigate to="/auth" />;

  const myListings = listings.filter(l => l.sellerId === currentUser.id);

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this listing? This cannot be undone.")) {
      deleteListing(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <List className="text-blue-600 dark:text-blue-400" />
            Manage My Listings
        </h1>
        <Link to="/marketplace" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 font-medium transition-colors">
           <Plus size={18} /> Create New
        </Link>
      </div>

      {myListings.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-12 text-center">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No listings yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't posted any vehicles or parts for sale.</p>
            <Link to="/marketplace" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
                Go to Marketplace to list an item
            </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Item</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date Posted</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                        {myListings.map(listing => (
                            <tr key={listing.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-12 w-12 flex-shrink-0 bg-gray-100 dark:bg-slate-600 rounded-md overflow-hidden">
                                            <img className="h-full w-full object-cover" src={listing.images[0]} alt="" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{listing.title}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{listing.make} {listing.model}</div>
                                            <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 capitalize">
                                                {listing.type === 'car' ? 'Vehicle' : 'Part'}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-bold text-gray-900 dark:text-white">${listing.price.toLocaleString()}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{new Date(listing.createdAt).toLocaleDateString()}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={`/marketplace/${listing.id}`} className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mr-3 inline-flex items-center gap-1" title="View">
                                        <Eye size={16} />
                                    </Link>
                                    <Link to={`/marketplace/edit/${listing.id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-3 inline-flex items-center gap-1" title="Edit">
                                        <Edit size={16} />
                                    </Link>
                                    <button onClick={() => handleDelete(listing.id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 inline-flex items-center gap-1" title="Delete">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};

export default ManageListings;
