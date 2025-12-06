
import React from 'react';
import { useStore } from '../store';
import { User, Calendar, Award, LogIn, CheckCircle2, Lock, ShieldCheck, BadgeCheck } from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';

const Profile: React.FC = () => {
  const { currentUser, threads, posts, listings, verifyUser } = useStore();

  if (!currentUser) {
      return <Navigate to="/auth" />;
  }

  const myThreads = threads.filter(t => t.authorId === currentUser.id);
  const myPosts = posts.filter(p => p.authorId === currentUser.id);
  const myListings = listings.filter(l => l.sellerId === currentUser.id);

  // Verification Goals
  const GOAL_REPUTATION = 3;
  const GOAL_POSTS = 3;
  const GOAL_LISTINGS = 1;

  const currentReputation = currentUser.reputation;
  const currentPosts = myThreads.length + myPosts.length;
  const currentListings = myListings.length;

  const isReputationMet = currentReputation >= GOAL_REPUTATION;
  const isPostsMet = currentPosts >= GOAL_POSTS;
  const isListingsMet = currentListings >= GOAL_LISTINGS;
  
  const allGoalsMet = isReputationMet && isPostsMet && isListingsMet;

  const handleClaimVerification = () => {
      verifyUser(currentUser.id);
  };

  const ProgressItem = ({ label, current, target, met }: { label: string, current: number, target: number, met: boolean }) => (
      <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
              <span className={met ? "text-green-600 dark:text-green-400 font-bold" : "text-gray-500 dark:text-gray-400"}>
                  {current} / {target}
              </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
              <div 
                  className={`h-2.5 rounded-full transition-all duration-500 ${met ? 'bg-green-500' : 'bg-blue-500'}`} 
                  style={{ width: `${Math.min(100, (current / target) * 100)}%` }}
              ></div>
          </div>
      </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden mb-8">
        <div className="h-32 bg-slate-800"></div>
        <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-12 mb-6">
                <div className="relative">
                    <img 
                        src={currentUser.avatar} 
                        alt={currentUser.name} 
                        className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-800 object-cover"
                    />
                    {currentUser.isVerified && (
                        <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-sm">
                            <BadgeCheck className="text-blue-500" size={24} fill="white" />
                        </div>
                    )}
                </div>
                <Link to="/edit-profile" className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 px-4 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors">
                    Edit Profile
                </Link>
            </div>
            
            <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{currentUser.name}</h1>
                {currentUser.isVerified && (
                    <BadgeCheck className="text-blue-500" size={24} />
                )}
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{currentUser.email}</p>
            
            <div className="flex gap-6 border-b border-gray-100 dark:border-slate-700 pb-8 mb-8">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar size={18} />
                    <span>Joined {new Date(currentUser.joinedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Award size={18} />
                    <span>Reputation: {currentUser.reputation}</span>
                </div>
            </div>

            {/* Verification Status Card */}
            {!currentUser.isVerified ? (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-800 rounded-xl p-6 border border-blue-100 dark:border-slate-600 mb-8">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="bg-white dark:bg-slate-900 p-2 rounded-lg shadow-sm text-blue-600 dark:text-blue-400">
                            <ShieldCheck size={28} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Become a Verified Seller</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Complete these community goals to earn your verified badge and build trust.</p>
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-gray-100 dark:border-slate-700 shadow-sm">
                        <ProgressItem 
                            label="Community Reputation (Earned from others)" 
                            current={currentReputation} 
                            target={GOAL_REPUTATION} 
                            met={isReputationMet} 
                        />
                        <ProgressItem 
                            label="Forum Activity (Posts & Threads)" 
                            current={currentPosts} 
                            target={GOAL_POSTS} 
                            met={isPostsMet} 
                        />
                        <ProgressItem 
                            label="Active Listings" 
                            current={currentListings} 
                            target={GOAL_LISTINGS} 
                            met={isListingsMet} 
                        />
                        
                        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 flex justify-end">
                            {allGoalsMet ? (
                                <button 
                                    onClick={handleClaimVerification}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow-md transition-all flex items-center gap-2 animate-pulse"
                                >
                                    <BadgeCheck size={20} />
                                    Claim Verified Badge
                                </button>
                            ) : (
                                <button disabled className="bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400 px-6 py-2 rounded-lg font-bold flex items-center gap-2 cursor-not-allowed">
                                    <Lock size={16} />
                                    Goals Incomplete
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                 <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800/30 mb-8 flex items-center gap-3 text-green-800 dark:text-green-300">
                    <CheckCircle2 size={24} className="text-green-600 dark:text-green-400" />
                    <div>
                        <p className="font-bold">You are a Verified Seller!</p>
                        <p className="text-sm">Your profile and listings now display the trusted badge.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">My Threads ({myThreads.length})</h2>
                    {myThreads.length > 0 ? (
                        <div className="space-y-3">
                            {myThreads.map(t => (
                                <div key={t.id} className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-100 dark:border-slate-600">
                                    <h3 className="font-medium text-gray-900 dark:text-white">{t.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.views} views • {t.replies} replies</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">No discussions started yet.</p>
                    )}
                </div>

                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Listings ({myListings.length})</h2>
                        <Link to="/manage-listings" className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">
                            Manage
                        </Link>
                    </div>
                    {myListings.length > 0 ? (
                        <div className="space-y-3">
                            {myListings.map(l => (
                                <div key={l.id} className="flex gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-100 dark:border-slate-600">
                                    <div className="w-16 h-16 bg-gray-200 dark:bg-slate-600 rounded overflow-hidden flex-shrink-0">
                                        <img src={l.images[0]} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">{l.title}</h3>
                                        <p className="text-blue-600 dark:text-blue-400 font-bold">${l.price.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">No active listings.</p>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
