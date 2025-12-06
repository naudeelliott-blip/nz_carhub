
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useStore } from '../store';
import { ArrowLeft, Save, Upload, X, AlertCircle } from 'lucide-react';
import { Listing } from '../types';

const EditListing: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const { currentUser, listings, updateListing } = useStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Listing>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const LOCATIONS = ["Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga", "Dunedin", "Palmerston North", "Northland", "Waikato", "Bay of Plenty"];

  useEffect(() => {
    if (listingId && listings.length > 0) {
      const listing = listings.find(l => l.id === listingId);
      if (listing) {
        if (currentUser && listing.sellerId !== currentUser.id) {
          alert("You do not have permission to edit this listing.");
          navigate('/marketplace');
          return;
        }
        setFormData(listing);
      } else {
        // Listing not found
        navigate('/marketplace');
      }
      setIsLoading(false);
    }
  }, [listingId, listings, currentUser, navigate]);

  if (!currentUser) return <Navigate to="/auth" />;
  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!formData.id) return <Navigate to="/marketplace" />;

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
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), base64String]
        }));
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, index) => index !== indexToRemove)
    }));
  };

  const getInputClass = (field: string) => 
    `w-full border rounded-lg p-2.5 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-all 
    ${errors[field] 
        ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500' 
        : 'border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500'
    }`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Custom Validation
    const newErrors: Record<string, boolean> = {};
    if (!formData.make?.trim()) newErrors.make = true;
    if (!formData.model?.trim()) newErrors.model = true;
    if (!formData.year) newErrors.year = true;
    if (!formData.price || formData.price <= 0) newErrors.price = true;
    if (!formData.location) newErrors.location = true;
    if (!formData.title?.trim()) newErrors.title = true;
    
    if (formData.type === 'car') {
        if (formData.odometer === undefined || formData.odometer === null) newErrors.odometer = true;
    }

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        window.scrollTo(0, 0);
        return;
    }

    if (listingId) {
      updateListing(listingId, formData);
      navigate(`/marketplace/${listingId}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 font-medium transition-colors"
      >
        <ArrowLeft size={20} /> Cancel
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Listing</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Update details for {formData.title}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8" noValidate>
             {/* Error Banner */}
             {Object.keys(errors).length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" size={18} />
                    <div>
                        <h4 className="font-bold text-red-800 dark:text-red-300 text-sm">Please fix the highlighted fields</h4>
                        <p className="text-red-600 dark:text-red-400 text-sm mt-1">Some required information is missing or invalid.</p>
                    </div>
                </div>
            )}

            {/* Listing Type (Read Only) */}
            <div>
                 <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">Listing Type</label>
                 <div className="inline-flex items-center px-3 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium text-sm border border-blue-200 dark:border-blue-800">
                    {formData.type === 'car' ? 'Vehicle' : 'Car Part / Accessory'}
                 </div>
            </div>

             {/* Section 1: Item Details */}
             <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</span>
                  Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div>
                       <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">Make</label>
                       <input 
                           className={getInputClass('make')}
                           value={formData.make || ''} 
                           onChange={e => {
                               setFormData({...formData, make: e.target.value});
                               if (errors.make) setErrors({...errors, make: false});
                           }}
                       />
                   </div>
                   <div>
                       <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">Model</label>
                       <input 
                           className={getInputClass('model')}
                           value={formData.model || ''} 
                           onChange={e => {
                               setFormData({...formData, model: e.target.value});
                               if (errors.model) setErrors({...errors, model: false});
                           }}
                       />
                   </div>
                   <div>
                       <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">Year</label>
                       <input 
                           type="number" 
                           className={getInputClass('year')}
                           value={formData.year || ''} 
                           onChange={e => {
                               setFormData({...formData, year: Number(e.target.value)});
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
                           value={formData.price || ''} 
                           onChange={e => {
                               setFormData({...formData, price: Number(e.target.value)});
                               if (errors.price) setErrors({...errors, price: false});
                           }}
                       />
                   </div>
                   {formData.type === 'car' && (
                     <div>
                         <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">Odometer (km)</label>
                         <input 
                             type="number" 
                             className={getInputClass('odometer')}
                             value={formData.odometer !== undefined ? formData.odometer : ''} 
                             onChange={e => {
                                 setFormData({...formData, odometer: Number(e.target.value)});
                                 if (errors.odometer) setErrors({...errors, odometer: false});
                             }}
                         />
                     </div>
                   )}
                   <div className={formData.type === 'part' ? 'col-span-2' : ''}>
                       <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">Location</label>
                       <select 
                           className={getInputClass('location')}
                           value={formData.location || ''}
                           onChange={e => {
                               setFormData({...formData, location: e.target.value});
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
                             value={formData.title || ''} 
                             onChange={e => {
                                 setFormData({...formData, title: e.target.value});
                                 if (errors.title) setErrors({...errors, title: false});
                             }}
                         />
                     </div>

                     <div>
                         <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">Detailed Description</label>
                         <textarea 
                             className="w-full border border-gray-300 dark:border-slate-600 rounded-lg p-3 min-h-[120px] focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white" 
                             value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})}
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
                         <span>Click to add photo</span>
                       </button>
                     </div>
                </div>

                {formData.images && formData.images.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {formData.images.map((img, index) => (
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

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-slate-700">
                <button 
                    type="button" 
                    onClick={() => navigate(-1)}
                    className="px-6 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button 
                    type="submit"
                    className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-blue-700 shadow-md flex items-center gap-2 transition-all"
                >
                    <Save size={18} /> Update Listing
                </button>
            </div>

        </form>
      </div>
    </div>
  );
};

export default EditListing;
