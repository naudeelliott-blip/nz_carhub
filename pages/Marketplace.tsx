
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { Listing } from '../types';
import { Filter, Search, MapPin, ArrowLeft, Plus, Image as ImageIcon, Upload, Trash2, X, MessageSquare, Send, BadgeCheck, ThumbsUp, RotateCcw, ChevronDown, ChevronUp, AlertCircle, Edit, Heart } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Marketplace: React.FC = () => {
  const { listings, users, currentUser, addListing, deleteListing, sendDirectMessage, giveReputation, addToHistory, toggleSavedListing } = useStore();
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();

  // Contact Seller State
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');

  // Filter State
  const [showFilters, setShowFilters] = useState(false); // Default to closed to minimize space
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'car' | 'part'>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [makeFilter, setMakeFilter] = useState('');
  const [minYear, setMinYear] = useState('');
  const [maxYear, setMaxYear] = useState('');
  const [minOdometer, setMinOdometer] = useState('');
  const [maxOdometer, setMaxOdometer] = useState('');

  // Create Listing State
  const [newListing, setNewListing] = useState<Partial<Listing>>({
    type: 'car',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    odometer: 0,
    location: '',
    title: '',
    description: '',
    images: [],
    isFeatured: false
  });
  
  // Validation State
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  
  // Image handling state
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived State
  const activeFiltersCount = [
    typeFilter !== 'all',
    minPrice, maxPrice,
    locationFilter,
    makeFilter,
    minYear, maxYear,
    minOdometer, maxOdometer
  ].filter(Boolean).length;

  const filteredListings = listings.filter(l => {
    // Search Term (Keywords)
    const matchesSearch = l.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          l.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          l.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Type Filter
    const matchesType = typeFilter === 'all' || l.type === typeFilter;
    
    // Price Filter
    const price = l.price;
    const min = minPrice ? Number(minPrice) : 0;
    const max = maxPrice ? Number(maxPrice) : Infinity;
    const matchesPrice = price >= min && price <= max;

    // Location Filter
    const matchesLocation = locationFilter === '' || l.location === locationFilter;

    // Make Filter
    const matchesMake = makeFilter === '' || l.make.toLowerCase() === makeFilter.toLowerCase();

    // Year Filter
    const year = l.year;
    const minY = minYear ? Number(minYear) : 0;
    const maxY = maxYear ? Number(maxYear) : Infinity;
    const matchesYear = year >= minY && year <= maxY;

    // Odometer Filter (only relevant for cars mainly, but applied if set)
    const odo = l.odometer;
    const minO = minOdometer ? Number(minOdometer) : 0;
    const maxO = maxOdometer ? Number(maxOdometer) : Infinity;
    const matchesOdometer = odo >= minO && odo <= maxO;

    return matchesSearch && matchesType && matchesPrice && matchesLocation && matchesMake && matchesYear && matchesOdometer;
  });

  const LOCATIONS = ["Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga", "Dunedin", "Palmerston North", "Northland", "Waikato", "Bay of Plenty"];
  
  // Combine existing makes with common ones for the dropdown
  const AVAILABLE_MAKES = Array.from(new Set([
      ...listings.map(l => l.make),
      "Toyota", "Nissan", "Mazda", "Ford", "Holden", "Subaru", "Mitsubishi", "Honda", "BMW", "Audi", "Volkswagen", "Suzuki", "Kia", "Hyundai"
  ])).sort();

  const handleListingClick = (id: string) => {
    addToHistory(id);
    setSelectedListingId(id);
  };

  const clearFilters = () => {
      setSearchTerm('');
      setTypeFilter('all');
      setMinPrice('');
      setMaxPrice('');
      setLocationFilter('');
      setMakeFilter('');
      setMinYear('');
      setMaxYear('');
      setMinOdometer('');
      setMaxOdometer('');
  };

  const handleCreateListingClick = () => {
      if (!currentUser) {
          navigate('/auth');
          return;
      }
      setIsCreateModalOpen(true);
      setErrors({});
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5000000) { 
        alert("File is too large! Please select an image under 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setNewListing(prev => ({
          ...prev,
          images: [...(prev.images || []), base64String]
        }));
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setNewListing(prev => ({
      ...prev,
      images: prev.images?.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Custom Validation Logic
    const newErrors: Record<string, boolean> = {};
    
    if (!newListing.make?.trim()) newErrors.make = true;
    if (!newListing.model?.trim()) newErrors.model = true;
    if (!newListing.year) newErrors.year = true;
    if (!newListing.price || newListing.price <= 0) newErrors.price = true;
    if (!newListing.location) newErrors.location = true;
    if (!newListing.title?.trim()) newErrors.title = true;
    
    // Type specific validation
    if (newListing.type === 'car') {
        if (!newListing.odometer && newListing.odometer !== 0) newErrors.odometer = true; // Checking for undefined/null/empty, 0 is technically valid but rare for 'required' check on new listing
        if (newListing.odometer === undefined || newListing.odometer === null) newErrors.odometer = true;
    }

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        // Scroll to the first error or top of modal
        const modalContent = document.querySelector('.overflow-y-auto');
        if (modalContent) modalContent.scrollTop = 0;
        return;
    }

    addListing({
        title: newListing.title!,
        description: newListing.description || '',
        price: Number(newListing.price),
        make: newListing.make || 'Generic',
        model: newListing.model || (newListing.type === 'car' ? 'Vehicle' : 'Part'),
        year: Number(newListing.year),
        odometer: Number(newListing.odometer) || 0,
        location: newListing.location || 'NZ',
        type: newListing.type as 'car' | 'part',
        images: newListing.images,
        isFeatured: newListing.isFeatured
    });
    
    setIsCreateModalOpen(false);
    setNewListing({
        type: 'car',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        price: 0,
        odometer: 0,
        location: '',
        title: '',
        description: '',
        images: [],
        isFeatured: false
    });
    setErrors({});
  };

  const handleContactSellerClick = (listing: Listing) => {
    if (!currentUser) {
        navigate('/auth');
        return;
    }
    if (currentUser.id === listing.sellerId) {
        alert("This is your own listing!");
        return;
    }
    
    setContactMessage(`Hi, I'm interested in your listing "${listing.title}". Is it still available?`);
    setIsContactModalOpen(true);
  };

  const handleSendContactMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const listing = listings.find(l => l.id === selectedListingId);
    if (!listing || !currentUser) return;

    sendDirectMessage(
        listing.sellerId,
        listing.sellerName || "Seller",
        contactMessage,
        listing.id
    );

    setIsContactModalOpen(false);
    setContactMessage('');
    navigate('/inbox');
  };

  const handleDeleteListing = () => {
      if (selectedListingId && window.confirm("Are you sure you want to delete this listing?")) {
          deleteListing(selectedListingId);
          setSelectedListingId(null);
      }
  };

  const handleGiveReputation = (sellerId: string) => {
      if (!currentUser) {
          navigate('/auth');
          return;
      }
      if (currentUser.id === sellerId) return;
      
      giveReputation(sellerId);
      alert("Reputation given! Thanks for helping the community.");
  };

  const handleToggleSaved = (e: React.MouseEvent, listingId: string) => {
    e.stopPropagation(); // Prevent card click
    if (!currentUser) {
        navigate('/auth');
        return;
    }
    toggleSavedListing(listingId);
  };

  // Helper for input styling
  const getInputClass = (field: string) => 
      `w-full border rounded-lg p-2.5 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-all 
      ${errors[field] 
          ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500' 
          : 'border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500'
      }`;

  // Sub-components
  const ListingDetail = () => {
    const listing = listings.find(l => l.id === selectedListingId);
    if (!listing) return <div>Listing not found</div>;

    const isOwner = currentUser?.id === listing.sellerId;
    const seller = users.find(u => u.id === listing.sellerId);
    const isSaved = currentUser?.savedListingIds?.includes(listing.id);

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <button 
                onClick={() => setSelectedListingId(null)} 
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 font-medium"
            >
                <ArrowLeft size={20} /> Back to Listings
            </button>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Images */}
                <div className="bg-gray-100 dark:bg-slate-700 rounded-xl overflow-hidden shadow-sm aspect-video lg:aspect-square relative">
                    {listing.images && listing.images.length > 0 ? (
                      <>
                        <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                        {listing.images.length > 1 && (
                          <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
                             + {listing.images.length - 1} more
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                        <ImageIcon size={48} />
                      </div>
                    )}
                </div>

                {/* Info */}
                <div>
                    <div className="mb-6">
                        <div className="flex justify-between items-start mb-2">
                            <span className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wide">
                                {listing.type === 'car' ? 'Vehicle' : 'Part'}
                            </span>
                            <button 
                                onClick={(e) => handleToggleSaved(e, listing.id)}
                                className={`p-2 rounded-full transition-colors ${isSaved ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                                title={isSaved ? "Remove from Saved" : "Save Listing"}
                            >
                                <Heart size={24} fill={isSaved ? "currentColor" : "none"} />
                            </button>
                        </div>
                        <div className="flex justify-between items-start">
                             <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{listing.title}</h1>
                             {isOwner && (
                                 <div className="flex gap-2">
                                     <Link to={`/marketplace/edit/${listing.id}`} className="text-gray-400 hover:text-blue-600 p-2" title="Edit Listing">
                                         <Edit size={24} />
                                     </Link>
                                     <button onClick={handleDeleteListing} className="text-gray-400 hover:text-red-600 p-2" title="Delete Listing">
                                         <Trash2 size={24} />
                                     </button>
                                 </div>
                             )}
                        </div>
                        <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">${listing.price.toLocaleString()}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 mb-6 grid grid-cols-2 gap-y-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                            <p className="font-medium flex items-center gap-1 text-gray-900 dark:text-white"><MapPin size={16} /> {listing.location}</p>
                        </div>
                        {listing.type === 'car' && (
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Odometer</p>
                                <p className="font-medium text-gray-900 dark:text-white">{listing.odometer.toLocaleString()} km</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Make</p>
                            <p className="font-medium text-gray-900 dark:text-white">{listing.make}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Year</p>
                            <p className="font-medium text-gray-900 dark:text-white">{listing.year}</p>
                        </div>
                         <div className="col-span-2 border-t border-gray-100 dark:border-slate-700 pt-4 mt-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Seller</p>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900 dark:text-white">{seller?.name || listing.sellerName}</span>
                                    {seller?.isVerified && (
                                        <BadgeCheck size={18} className="text-blue-500 dark:text-blue-400" fill="currentColor" />
                                    )}
                                </div>
                                {!isOwner && seller && (
                                    <button 
                                        onClick={() => handleGiveReputation(seller.id)}
                                        className="text-xs flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-200 dark:border-slate-600 px-2 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <ThumbsUp size={12} />
                                        Give Rep ({seller.reputation})
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="prose dark:prose-invert text-gray-700 dark:text-gray-300 mb-8">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Seller's Description</h3>
                        <p className="whitespace-pre-wrap">{listing.description}</p>
                    </div>

                    <div className="space-y-4">
                       {/* Additional Images Grid if any */}
                       {listing.images.length > 1 && (
                         <div className="grid grid-cols-4 gap-2 mb-6">
                           {listing.images.slice(1).map((img, idx) => (
                             <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
                               <img src={img} alt={`Extra ${idx}`} className="w-full h-full object-cover" />
                             </div>
                           ))}
                         </div>
                       )}

                       {!isOwner ? (
                           <button 
                                onClick={() => handleContactSellerClick(listing)}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                           >
                               <MessageSquare size={20} />
                               Contact Seller
                           </button>
                       ) : (
                           <div className="w-full bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 py-4 rounded-xl font-bold text-center">
                               You own this listing
                           </div>
                       )}
                    </div>
                </div>
            </div>
        </div>
    );
  };

  if (selectedListingId) return (
      <>
        <ListingDetail />
        {/* Contact Seller Modal */}
        {isContactModalOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Contact Seller</h3>
                        <button onClick={() => setIsContactModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <X size={24} />
                        </button>
                    </div>
                    <form onSubmit={handleSendContactMessage}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                            <textarea 
                                className="w-full border border-gray-300 dark:border-slate-600 rounded-md p-3 focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                value={contactMessage}
                                onChange={e => setContactMessage(e.target.value)}
                                required
                            ></textarea>
                        </div>
                        <div className="flex justify-end pt-2">
                             <button 
                                type="button" 
                                onClick={() => setIsContactModalOpen(false)}
                                className="text-gray-600 dark:text-gray-400 mr-4 font-medium"
                             >
                                Cancel
                             </button>
                             <button 
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 flex items-center gap-2"
                             >
                                <Send size={16} /> Send Message
                             </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
      </>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Marketplace</h1>
        <div className="flex w-full lg:w-auto gap-2 flex-col sm:flex-row">
          <div className="flex gap-2 flex-1 sm:flex-initial">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border ${showFilters ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-slate-700 dark:text-blue-400 dark:border-slate-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-slate-800 dark:text-gray-300 dark:border-slate-600 dark:hover:bg-slate-700'}`}
              >
                 <Filter size={18} /> 
                 Filters
                 {activeFiltersCount > 0 && (
                     <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                         {activeFiltersCount}
                     </span>
                 )}
                 {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Search makes, models..." 
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
          </div>
          <button 
            onClick={handleCreateListingClick}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Plus size={18} /> Create Listing
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        {showFilters && (
            <div className="w-full lg:w-64 flex-shrink-0 animate-in fade-in slide-in-from-top-4 duration-200">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm space-y-5">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-2">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Refine Search</span>
                        {(searchTerm || activeFiltersCount > 0) && (
                            <button 
                                onClick={clearFilters}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                            >
                                <RotateCcw size={12} /> Clear
                            </button>
                        )}
                    </div>
                    
                    {/* Type Filter */}
                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Type</h4>
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 p-1 -ml-1 rounded">
                                <input 
                                    type="radio" name="type" 
                                    checked={typeFilter === 'all'} 
                                    onChange={() => setTypeFilter('all')}
                                    className="text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">All Listings</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 p-1 -ml-1 rounded">
                                <input 
                                    type="radio" name="type" 
                                    checked={typeFilter === 'car'}
                                    onChange={() => setTypeFilter('car')}
                                    className="text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Vehicles Only</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 p-1 -ml-1 rounded">
                                <input 
                                    type="radio" name="type" 
                                    checked={typeFilter === 'part'}
                                    onChange={() => setTypeFilter('part')}
                                    className="text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Parts Only</span>
                            </label>
                        </div>
                    </div>

                    {/* Make Filter */}
                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Make</h4>
                        <select
                            className="w-full border border-gray-300 dark:border-slate-600 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                            value={makeFilter}
                            onChange={(e) => setMakeFilter(e.target.value)}
                        >
                            <option value="">Any Make</option>
                            {AVAILABLE_MAKES.map(make => (
                                <option key={make} value={make}>{make}</option>
                            ))}
                        </select>
                    </div>

                    {/* Price Filter */}
                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Price ($)</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <input 
                                type="number" 
                                placeholder="Min" 
                                className="w-full border border-gray-300 dark:border-slate-600 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                            />
                            <input 
                                type="number" 
                                placeholder="Max" 
                                className="w-full border border-gray-300 dark:border-slate-600 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Year Filter */}
                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Year</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <input 
                                type="number" 
                                placeholder="From" 
                                className="w-full border border-gray-300 dark:border-slate-600 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                value={minYear}
                                onChange={(e) => setMinYear(e.target.value)}
                            />
                            <input 
                                type="number" 
                                placeholder="To" 
                                className="w-full border border-gray-300 dark:border-slate-600 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                value={maxYear}
                                onChange={(e) => setMaxYear(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Odometer Filter - Conditional */}
                    {typeFilter !== 'part' && (
                        <div>
                            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Odometer (km)</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <input 
                                    type="number" 
                                    placeholder="Min" 
                                    className="w-full border border-gray-300 dark:border-slate-600 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                    value={minOdometer}
                                    onChange={(e) => setMinOdometer(e.target.value)}
                                />
                                <input 
                                    type="number" 
                                    placeholder="Max" 
                                    className="w-full border border-gray-300 dark:border-slate-600 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                    value={maxOdometer}
                                    onChange={(e) => setMaxOdometer(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Location Filter */}
                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Location</h4>
                        <select 
                            className="w-full border border-gray-300 dark:border-slate-600 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                        >
                            <option value="">All New Zealand</option>
                            {LOCATIONS.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        )}

        {/* Listing Grid */}
        <div className="flex-1">
            {filteredListings.length === 0 ? (
                <div className="text-center py-20 text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
                    <Search className="mx-auto h-12 w-12 text-gray-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No listings found</h3>
                    <p className="mt-1">Try adjusting your search or filters to find what you're looking for.</p>
                    <button onClick={clearFilters} className="mt-4 text-blue-600 dark:text-blue-400 font-medium hover:underline">Clear all filters</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredListings.map(listing => {
                    const seller = users.find(u => u.id === listing.sellerId);
                    const isSaved = currentUser?.savedListingIds?.includes(listing.id);
                    return (
                        <div 
                            key={listing.id} 
                            onClick={() => handleListingClick(listing.id)}
                            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-900 transition-all cursor-pointer group overflow-hidden relative"
                        >
                            <div className="aspect-[4/3] bg-gray-200 dark:bg-slate-700 relative overflow-hidden">
                                <img 
                                    src={listing.images[0]} 
                                    alt={listing.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                    <span className="text-white font-bold text-lg">${listing.price.toLocaleString()}</span>
                                </div>
                                {listing.type === 'part' && (
                                    <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold uppercase shadow-sm">
                                        Part
                                    </div>
                                )}
                                {seller?.isVerified && (
                                    <div className="absolute top-2 left-2 bg-white/90 text-blue-600 p-1 rounded-full shadow-sm" title="Verified Seller">
                                        <BadgeCheck size={14} fill="currentColor" className="text-white bg-blue-600 rounded-full" />
                                    </div>
                                )}
                                <button 
                                    onClick={(e) => handleToggleSaved(e, listing.id)}
                                    className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors z-10 ${
                                        listing.type === 'part' ? 'top-10' : ''
                                    } ${
                                        isSaved ? 'bg-white text-red-500 shadow-md' : 'bg-black/20 text-white hover:bg-black/40'
                                    }`}
                                    title={isSaved ? "Unsave" : "Save"}
                                >
                                    <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
                                </button>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{listing.title}</h3>
                                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-3 gap-2">
                                    <span className="bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs font-medium">{listing.year}</span>
                                    {listing.type === 'car' && (
                                        <>
                                            <span className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full"></span>
                                            <span>{listing.odometer.toLocaleString()} km</span>
                                        </>
                                    )}
                                </div>
                                <div className="flex items-center text-gray-400 dark:text-gray-500 text-xs">
                                    <MapPin size={12} className="mr-1" /> {listing.location}
                                </div>
                            </div>
                        </div>
                    );
                })}
                </div>
            )}
        </div>
      </div>

      {/* Create Listing Modal */}
      {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-3xl flex flex-col shadow-2xl relative max-h-[90vh]">
                  {/* Fixed Header */}
                  <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-700 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Listing</h2>
                    <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                        <X size={24} />
                    </button>
                  </div>
                  
                  {/* Scrollable Content */}
                  <div className="p-6 overflow-y-auto flex-1 text-gray-900 dark:text-white">
                    {/* Error Banner */}
                    {Object.keys(errors).length > 0 && (
                        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" size={18} />
                            <div>
                                <h4 className="font-bold text-red-800 dark:text-red-300 text-sm">Please fix the highlighted fields</h4>
                                <p className="text-red-600 dark:text-red-400 text-sm mt-1">Some required information is missing or invalid.</p>
                            </div>
                        </div>
                    )}

                    <form id="create-listing-form" onSubmit={handleCreateSubmit} className="space-y-8" noValidate>
                        
                        {/* Section 0: Listing Type */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">What are you selling?</label>
                            <div className="grid grid-cols-2 gap-4">
                                <label className={`border rounded-xl p-4 cursor-pointer text-center transition-all ${newListing.type === 'car' ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 ring-1 ring-blue-500 text-blue-700 dark:text-blue-300 font-bold' : 'hover:bg-gray-50 dark:hover:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400'}`}>
                                    <input 
                                        type="radio" name="listingType" className="hidden" 
                                        checked={newListing.type === 'car'} 
                                        onChange={() => setNewListing({...newListing, type: 'car'})} 
                                    />
                                    <span>Vehicle</span>
                                </label>
                                <label className={`border rounded-xl p-4 cursor-pointer text-center transition-all ${newListing.type === 'part' ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 ring-1 ring-blue-500 text-blue-700 dark:text-blue-300 font-bold' : 'hover:bg-gray-50 dark:hover:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400'}`}>
                                    <input 
                                        type="radio" name="listingType" className="hidden" 
                                        checked={newListing.type === 'part'} 
                                        onChange={() => setNewListing({...newListing, type: 'part'})} 
                                    />
                                    <span>Car Part / Accessory</span>
                                </label>
                            </div>
                        </div>

                         {/* Promotion Section */}
                         <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">Promote your listing</label>
                            <label className={`block border rounded-xl p-4 cursor-pointer transition-all ${newListing.isFeatured ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 ring-1 ring-yellow-500' : 'hover:bg-gray-50 dark:hover:bg-slate-700 border-gray-200 dark:border-slate-600'}`}>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="checkbox"
                                        className="h-5 w-5 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                                        checked={newListing.isFeatured} 
                                        onChange={(e) => setNewListing({...newListing, isFeatured: e.target.checked})} 
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                             <span className={`font-bold ${newListing.isFeatured ? 'text-yellow-800 dark:text-yellow-400' : 'text-gray-700 dark:text-gray-300'}`}>Feature this listing</span>
                                             {newListing.isFeatured && <BadgeCheck size={16} className="text-yellow-600" fill="currentColor" />}
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Get 3x more views by appearing on the homepage.</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-bold text-gray-900 dark:text-white">$9.99</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">One-time fee</span>
                                    </div>
                                </div>
                            </label>
                         </div>

                        {/* Section 1: Item Details */}
                        <div>
                           <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                             <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</span>
                             {newListing.type === 'car' ? 'Vehicle Details' : 'Part Details'}
                           </h3>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">Make</label>
                                  <input 
                                      className={getInputClass('make')}
                                      value={newListing.make} 
                                      onChange={e => {
                                          setNewListing({...newListing, make: e.target.value});
                                          if (errors.make) setErrors({...errors, make: false});
                                      }}
                                      placeholder="e.g. Toyota" 
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">Model</label>
                                  <input 
                                      className={getInputClass('model')}
                                      value={newListing.model} 
                                      onChange={e => {
                                          setNewListing({...newListing, model: e.target.value});
                                          if (errors.model) setErrors({...errors, model: false});
                                      }}
                                      placeholder="e.g. Corolla" 
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">Year</label>
                                  <input 
                                      type="number" 
                                      className={getInputClass('year')}
                                      value={newListing.year} 
                                      onChange={e => {
                                          setNewListing({...newListing, year: Number(e.target.value)});
                                          if (errors.year) setErrors({...errors, year: false});
                                      }}
                                  />
                              </div>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                              <div>
                                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">Price ($)</label>
                                  <input 
                                      type="number" 
                                      className={getInputClass('price')}
                                      value={newListing.price || ''} 
                                      onChange={e => {
                                          setNewListing({...newListing, price: Number(e.target.value)});
                                          if (errors.price) setErrors({...errors, price: false});
                                      }}
                                  />
                              </div>
                              {newListing.type === 'car' && (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">Odometer (km)</label>
                                    <input 
                                        type="number" 
                                        className={getInputClass('odometer')}
                                        value={newListing.odometer || ''} 
                                        onChange={e => {
                                            setNewListing({...newListing, odometer: Number(e.target.value)});
                                            if (errors.odometer) setErrors({...errors, odometer: false});
                                        }}
                                    />
                                </div>
                              )}
                              <div className={newListing.type === 'part' ? 'col-span-2' : ''}>
                                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">Location</label>
                                  <select 
                                      className={getInputClass('location')}
                                      value={newListing.location}
                                      onChange={e => {
                                          setNewListing({...newListing, location: e.target.value});
                                          if (errors.location) setErrors({...errors, location: false});
                                      }}
                                  >
                                      <option value="">Select Region</option>
                                      {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                                  </select>
                              </div>
                           </div>
                        </div>

                        {/* Section 2: Description */}
                        <div>
                           <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                             <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">2</span>
                             Description
                           </h3>
                           <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">Listing Title</label>
                                    <input 
                                        className={getInputClass('title')}
                                        value={newListing.title} 
                                        onChange={e => {
                                            setNewListing({...newListing, title: e.target.value});
                                            if (errors.title) setErrors({...errors, title: false});
                                        }}
                                        placeholder={newListing.type === 'car' ? "e.g. 2010 Toyota Corolla - Low Kms" : "e.g. R34 Skyline Headlights - Pair"} 
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">Detailed Description</label>
                                    <textarea 
                                        className="w-full border border-gray-300 dark:border-slate-600 rounded-lg p-3 min-h-[120px] focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700" 
                                        value={newListing.description} onChange={e => setNewListing({...newListing, description: e.target.value})}
                                        placeholder="Tell buyers about the condition, history, and reason for selling..."
                                    />
                                </div>
                           </div>
                        </div>

                         {/* Section 3: Images */}
                         <div>
                           <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                             <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">3</span>
                             Photos
                           </h3>
                           
                           {/* Image Input Area */}
                           <div className="mb-4">
                                <div className="relative">
                                  <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    className="hidden" 
                                    accept="image/*"
                                  />
                                  <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-6 py-4 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 font-medium text-base transition-colors border-2 border-dashed border-gray-300 dark:border-slate-500 hover:border-blue-400 hover:text-blue-600"
                                  >
                                    <Upload size={20} /> 
                                    <span>Click to upload photo</span>
                                  </button>
                                  <p className="text-center text-xs text-gray-400 mt-2">Maximum file size: 5MB</p>
                                </div>
                           </div>

                           {/* Image Previews */}
                           {newListing.images && newListing.images.length > 0 ? (
                             <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                               {newListing.images.map((img, index) => (
                                 <div key={index} className="relative group aspect-square bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-600">
                                   <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                   <button
                                     type="button"
                                     onClick={() => handleRemoveImage(index)}
                                     className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                   >
                                     <X size={12} />
                                   </button>
                                 </div>
                               ))}
                             </div>
                           ) : (
                             <div className="text-center py-6 text-gray-400 text-sm">
                               <p>No photos added yet.</p>
                             </div>
                           )}
                        </div>

                    </form>
                  </div>

                  {/* Fixed Footer */}
                  <div className="p-6 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3 bg-white dark:bg-slate-800 rounded-b-xl flex-shrink-0">
                      <button 
                          type="button" 
                          onClick={() => setIsCreateModalOpen(false)}
                          className="text-gray-600 dark:text-gray-400 font-medium px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                          type="submit"
                          form="create-listing-form"
                          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
                      >
                          Publish Listing
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Marketplace;