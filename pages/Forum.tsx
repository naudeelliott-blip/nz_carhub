
import React, { useState } from 'react';
import { useStore } from '../store';
import { MessageCircle, Hash, Eye, MessageSquare, ArrowLeft, PlusCircle, Pin, Trash2, X, BadgeCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Forum: React.FC = () => {
  const { categories, threads, posts, users, currentUser, addThread, addPost, deleteThread, deletePost, incrementThreadViews } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Create Thread State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');

  // Create Post State
  const [newReplyContent, setNewReplyContent] = useState('');

  // Navigation handlers
  const handleCategoryClick = (id: string) => {
    setSelectedCategory(id);
    setSelectedThread(null);
  };
  
  const handleThreadClick = (id: string) => {
    incrementThreadViews(id);
    setSelectedThread(id);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedThread(null);
  };

  const handleBackToThreads = () => {
    setSelectedThread(null);
  };

  // Logic Handlers
  const handleCreateThreadClick = () => {
      if (!currentUser) {
          navigate('/auth');
          return;
      }
      setIsCreateModalOpen(true);
  };

  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !newThreadTitle.trim() || !newThreadContent.trim()) return;

    addThread({
      categoryId: selectedCategory,
      authorId: currentUser?.id || 'anon',
      title: newThreadTitle,
      content: newThreadContent
    });
    setIsCreateModalOpen(false);
    setNewThreadTitle('');
    setNewThreadContent('');
  };

  const handlePostReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThread || !newReplyContent.trim()) return;

    addPost({
        threadId: selectedThread,
        content: newReplyContent
    });
    setNewReplyContent('');
  };

  const handleDeleteThread = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm("Are you sure you want to delete this thread?")) {
        deleteThread(id);
        if (selectedThread === id) {
            handleBackToThreads();
        }
    }
  };

  const handleDeletePost = (id: string) => {
    if (window.confirm("Are you sure you want to delete this reply?")) {
        deletePost(id);
    }
  };

  // Views

  const renderCategoryList = () => (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Discussion Categories</h2>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className="flex items-start p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500 transition-all text-left"
          >
            <div className="p-3 bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 rounded-lg mr-4">
              <Hash size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{cat.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">{cat.description}</p>
              <div className="mt-3 text-sm text-gray-400 dark:text-gray-500 font-medium">
                {threads.filter(t => t.categoryId === cat.id).length} active threads
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderThreadList = () => {
    const category = categories.find(c => c.id === selectedCategory);
    const categoryThreads = threads.filter(t => t.categoryId === selectedCategory);

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
             <button onClick={handleBackToCategories} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-600 dark:text-gray-300">
                <ArrowLeft size={20} />
             </button>
             <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{category?.title}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Viewing all threads</p>
             </div>
          </div>
          <button 
              onClick={handleCreateThreadClick}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
              <PlusCircle size={18} />
              New Thread
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 divide-y divide-gray-100 dark:divide-slate-700">
          {categoryThreads.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No threads here yet. Be the first to start a conversation!
            </div>
          ) : (
            categoryThreads.map(thread => {
                const author = users.find(u => u.id === thread.authorId);
                return (
                <div
                key={thread.id}
                className="w-full text-left p-6 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors group flex justify-between items-start"
                >
                {/* Content Area */}
                <div 
                    onClick={() => handleThreadClick(thread.id)}
                    className="flex-1 cursor-pointer pr-4"
                >
                    <div className="flex items-center gap-2 mb-1">
                    {thread.isPinned && <Pin size={14} className="text-blue-600 dark:text-blue-400" fill="currentColor" />}
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {thread.title}
                    </h3>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-1">{thread.content}</p>
                    <div className="mt-2 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-4">
                        <div className="flex items-center gap-1">
                             <span>Posted by {author?.name || `User ${thread.authorId}`}</span>
                             {author?.isVerified && <BadgeCheck size={12} className="text-blue-500 dark:text-blue-400" fill="currentColor" />}
                        </div>
                        <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Actions Area */}
                <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="flex gap-6 text-gray-400 dark:text-gray-500 text-sm">
                        <div className="flex flex-col items-center">
                            <MessageSquare size={18} className="mb-1" />
                            <span>{thread.replies}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <Eye size={18} className="mb-1" />
                            <span>{thread.views}</span>
                        </div>
                    </div>
                    {currentUser && (currentUser.role === 'admin' || currentUser.id === thread.authorId) && (
                        <button 
                            onClick={(e) => handleDeleteThread(e, thread.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors relative z-10"
                            title="Delete Thread"
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <Trash2 size={20} />
                        </button>
                    )}
                </div>
                </div>
            )})
          )}
        </div>
      </div>
    );
  };

  const renderThreadView = () => {
    const thread = threads.find(t => t.id === selectedThread);
    const threadPosts = posts.filter(p => p.threadId === selectedThread);
    
    if (!thread) return <div>Thread not found</div>;

    const isThreadAuthor = currentUser && (currentUser.id === thread.authorId || currentUser.role === 'admin');
    const author = users.find(u => u.id === thread.authorId);

    return (
      <div className="max-w-4xl mx-auto">
        <button onClick={handleBackToThreads} className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
            <ArrowLeft size={18} />
            Back to {categories.find(c => c.id === thread.categoryId)?.title}
        </button>

        {/* Original Post */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{thread.title}</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400">
                             {author?.name || `User ${thread.authorId}`}
                             {author?.isVerified && <BadgeCheck size={14} className="text-blue-600 dark:text-blue-400" fill="currentColor" />}
                        </div>
                        <span>•</span>
                        <span>{new Date(thread.createdAt).toLocaleString()}</span>
                    </div>
                </div>
                {isThreadAuthor && (
                    <button 
                        onClick={(e) => handleDeleteThread(e, thread.id)}
                        className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete Thread"
                    >
                        <Trash2 size={20} />
                    </button>
                )}
            </div>
            <div className="p-8 text-gray-800 dark:text-gray-200 leading-relaxed text-lg">
                {thread.content}
            </div>
        </div>

        {/* Replies */}
        <div className="space-y-4 mb-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white px-2">{threadPosts.length} Replies</h3>
            {threadPosts.map(post => {
                const postAuthor = users.find(u => u.id === post.authorId);
                return (
                <div key={post.id} className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-slate-700 flex gap-4 group">
                    <div className="flex-shrink-0">
                         {postAuthor ? (
                             <img src={postAuthor.avatar} alt={postAuthor.name} className="w-10 h-10 rounded-full object-cover" />
                         ) : (
                             <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-500 font-bold">U</div>
                         )}
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                             <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-1">
                                    {postAuthor?.name || `User ${post.authorId}`}
                                    {postAuthor?.isVerified && <BadgeCheck size={14} className="text-blue-500 dark:text-blue-400" fill="currentColor" />}
                                </span>
                                <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                             </div>
                             {currentUser && (currentUser.id === post.authorId || currentUser.role === 'admin') && (
                                <button 
                                    onClick={() => handleDeletePost(post.id)}
                                    className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>
                             )}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{post.content}</p>
                    </div>
                </div>
            )})}
        </div>

        {/* Reply Box */}
        {currentUser ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 p-6">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-4">Post a Reply</h3>
                <form onSubmit={handlePostReply}>
                    <textarea 
                        className="w-full border border-gray-300 dark:border-slate-600 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        rows={4}
                        placeholder="Share your thoughts..."
                        value={newReplyContent}
                        onChange={e => setNewReplyContent(e.target.value)}
                    ></textarea>
                    <div className="mt-4 flex justify-end">
                        <button 
                            type="submit" 
                            disabled={!newReplyContent.trim()}
                            className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            Post Reply
                        </button>
                    </div>
                </form>
            </div>
        ) : (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg p-8 text-center">
                <p className="text-blue-800 dark:text-blue-300 mb-4">Join the conversation to post a reply.</p>
                <Link to="/auth" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors">
                    Log in to Reply
                </Link>
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {!selectedCategory && !selectedThread && renderCategoryList()}
      {selectedCategory && !selectedThread && renderThreadList()}
      {selectedThread && renderThreadView()}

      {/* Create Thread Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create New Thread</h3>
                    <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleCreateThread} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                        <input 
                            type="text" 
                            className="w-full border border-gray-300 dark:border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                            placeholder="e.g., Coolant leak on 2010 Subaru"
                            value={newThreadTitle}
                            onChange={e => setNewThreadTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
                        <textarea 
                            className="w-full border border-gray-300 dark:border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                            rows={5}
                            placeholder="Describe your question or discussion topic..."
                            value={newThreadContent}
                            onChange={e => setNewThreadContent(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end pt-2">
                         <button 
                            type="button" 
                            onClick={() => setIsCreateModalOpen(false)}
                            className="text-gray-600 dark:text-gray-400 mr-4 font-medium hover:text-gray-800 dark:hover:text-gray-200"
                         >
                            Cancel
                         </button>
                         <button 
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700"
                         >
                            Post Thread
                         </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Forum;
